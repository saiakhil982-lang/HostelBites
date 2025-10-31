import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.set("etag", false);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Disable caching for API responses to avoid 304/blank UI due to cached data
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isDev = app.get("env") === "development";
  if (isDev) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const requestedPort = parseInt(process.env.PORT || '5000', 10);
  const isWindows = process.platform === 'win32';
  const host = isWindows ? "127.0.0.1" : (isDev ? "127.0.0.1" : "0.0.0.0");

  // Avoid reusePort on Windows to prevent ENOTSUP
  const listenOptions: any = { port: requestedPort, host };
  if (!isWindows) {
    listenOptions.reusePort = true as const;
  }

  const startServer = (options: any) => {
    server.listen(options, () => {
      const addressInfo = server.address();
      if (typeof addressInfo === 'object' && addressInfo && 'port' in addressInfo) {
        const actualPort = addressInfo.port;
        log(`serving on http://${options.host}:${actualPort}`);
      } else {
        log(`serving on http://${options.host}:${options.port}`);
      }
    });
  };

  server.on('error', (err: any) => {
    if (err && err.code === 'ENOTSUP') {
      const fallback = { port: 0, host: '127.0.0.1' };
      log(`listen failed with ENOTSUP, retrying on http://${fallback.host}:<random>`);
      startServer(fallback);
    } else {
      throw err;
    }
  });

  startServer(listenOptions);
})();

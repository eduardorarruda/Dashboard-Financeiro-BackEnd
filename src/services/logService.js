class LogService {
  constructor() {
    this.logs = [];
    this.subscribers = [];
    this.isCapturing = false;
    this.originalConsoleLog = console.log;
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  /**
   * Inicia a captura de logs
   */
  startCapturing() {
    if (this.isCapturing) return;

    this.isCapturing = true;
    this.logs = [];
    this.subscribers = [];

    // Interceptar console.log
    console.log = (...args) => {
      this.originalConsoleLog(...args);
      this._addLog("log", args);
    };

    // Interceptar console.error
    console.error = (...args) => {
      this.originalConsoleError(...args);
      this._addLog("error", args);
    };

    // Interceptar console.warn
    console.warn = (...args) => {
      this.originalConsoleWarn(...args);
      this._addLog("warn", args);
    };
  }

  /**
   * Para a captura de logs e restaura console original
   */
  stopCapturing() {
    if (!this.isCapturing) return;

    this.isCapturing = false;

    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;

    // Notificar subscribers que a migração terminou
    this.notifySubscribers({
      type: "complete",
      timestamp: new Date().toISOString(),
    });

    // Limpar subscribers
    this.subscribers = [];
  }

  /**
   * Adiciona um log à fila
   * @private
   */
  _addLog(type, args) {
    const message = args
      .map((arg) => {
        if (typeof arg === "object") {
          return JSON.stringify(arg);
        }
        return String(arg);
      })
      .join(" ");

    const logEntry = {
      timestamp: new Date().toISOString(),
      type: type,
      message: message,
    };

    this.logs.push(logEntry);

    // Notificar todos os subscribers em tempo real
    this.notifySubscribers(logEntry);
  }

  /**
   * Registra um subscriber (SSE response)
   * @param {Response} res - Resposta Express para SSE
   */
  subscribe(res) {
    const subscriber = {
      res,
      id: Date.now() + Math.random(),
    };

    this.subscribers.push(subscriber);

    // Enviar logs anteriores se houver
    if (this.logs.length > 0) {
      this.logs.forEach((log) => {
        this._sendToSubscriber(subscriber, log);
      });
    }

    return subscriber.id;
  }

  /**
   * Remove um subscriber
   * @param {number} subscriberId - ID do subscriber
   */
  unsubscribe(subscriberId) {
    this.subscribers = this.subscribers.filter((s) => s.id !== subscriberId);
  }

  /**
   * Envia evento para todos os subscribers
   * @private
   */
  notifySubscribers(logEntry) {
    const validSubscribers = [];

    for (const subscriber of this.subscribers) {
      if (this._sendToSubscriber(subscriber, logEntry)) {
        validSubscribers.push(subscriber);
      }
    }

    this.subscribers = validSubscribers;
  }

  /**
   * Envia log para um subscriber específico
   * @private
   */
  _sendToSubscriber(subscriber, logEntry) {
    try {
      const data = JSON.stringify(logEntry);
      subscriber.res.write(`data: ${data}\n\n`);
      return true;
    } catch (error) {
      // Subscriber desconectado
      return false;
    }
  }

  /**
   * Retorna todos os logs coletados
   */
  getAllLogs() {
    return [...this.logs];
  }

  /**
   * Limpa os logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Retorna o número de subscribers ativos
   */
  getSubscriberCount() {
    return this.subscribers.length;
  }
}

// Singleton
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new LogService();
    }
    return instance;
  },
  LogService,
};

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        sub: string;
        rol: string;
        telefono: string;
        estado_verificacion: string;
      };
    }
  }
}

export {};

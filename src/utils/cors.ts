/**
 * Express cross domain Middleware
 */
export function cors() {
  return (req: any, res: any, next: any) => {
    // Allow all domain
    res.header('Access-Control-Allow-Origin', '*');
    // Allowed HTTP request method
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method.toLocaleLowerCase() === 'options') {
      res.sendStatus(200);
    } else {
      next();
    }
  };
}

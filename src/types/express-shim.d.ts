declare module 'express' {
      export type Request = import('express-serve-static-core').Request;
  export type Response = import('express-serve-static-core').Response;
  export type Router = any;
  const express: any;
  export default express;
}

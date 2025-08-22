// Shared route-related types
import {NextFunction, Request, Response} from 'express';

export type Req = Request;
export type Res = Response;
export type Next = NextFunction;

export type RouterModule = import('express').Router;

// Placeholder for future route-specific type exports
export { };


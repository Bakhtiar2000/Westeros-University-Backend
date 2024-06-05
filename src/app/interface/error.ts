export type TErrorSources = {
  path: string | number;
  message: string;
}[]; // Array of Object

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSources;
};

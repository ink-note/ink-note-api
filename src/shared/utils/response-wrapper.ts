/**
 * Represents the response object for operations.
 * @template T - The type of data associated with the response.
 */
export type OperationResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export class ResponseWrapper<DataType> {
  private success: boolean;
  private statusCode: number;
  private message: string;
  private data: DataType;

  /**
   * Constructs a new ResponseWrapper instance.
   *
   * @param {string | { success?: boolean; statusCode?: number; message?: string; data?: DataType }} arg1 - Either a string message or an object containing success, status code, message, and data.
   * @param {boolean} [success] - The success status. Defaults to true.
   * @param {number} [statusCode] - The status code. Defaults to 200.
   * @param {DataType} [data] - The data associated with the response.
   */
  constructor(
    arg1?: string | { success?: boolean; statusCode?: number; message?: string; data?: DataType },
    success?: boolean,
    statusCode?: number,
    data?: DataType,
  ) {
    const DEFAULT_STATUS_CODE = 200;
    const DEFAULT_SUCCESS = true;
    if (typeof arg1 === 'string') {
      this.message = arg1;
      this.success = success ?? DEFAULT_SUCCESS;
      this.statusCode = statusCode ?? DEFAULT_STATUS_CODE;
      this.data = data!;
    } else {
      this.success = arg1?.success ?? DEFAULT_SUCCESS;
      this.statusCode = arg1?.statusCode ?? DEFAULT_STATUS_CODE;
      this.message = arg1?.message;
      this.data = arg1?.data;
    }
  }

  /**
   * Wraps the operation response into an OperationResponse object.
   *
   * @return {OperationResponse<DataType>} The operation response object.
   */
  wrapResponse(): OperationResponse<DataType> {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    };
  }
}

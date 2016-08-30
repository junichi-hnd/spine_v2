interface IEventDispatcher {
  addEventListener(type: string, listener: Function, context: any, priority: number): void;
  on(type: string, listener: Function, context: any, priority: number): void;
  removeEventListener(type: string, listener: Function): void;
  off(type: string, listener: Function): void;
}
export default IEventDispatcher;
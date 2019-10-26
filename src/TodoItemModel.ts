
export class TodoItemModel { // item 定義用
  private id: number;
  private title: string;
  private isDone: boolean;
  constructor({ title }) {
    this.id = new Date().getTime()
    this.title = title
    this.isDone = false
  }
}
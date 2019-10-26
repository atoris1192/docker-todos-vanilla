import { element, render } from './html-util';
import { TodoItemModel } from './TodoItemModel';
import { EventEmitter } from './EventEmitter';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { config } from '../firebase';

firebase.initializeApp(config);
const db = firebase.firestore()
const collection = db.collection('todos')


class TodoListModel extends EventEmitter {  
  private todos: any[];
  constructor(todos = []) {
    super();
    this.todos = todos 
  }
  getTodos() {
    return this.todos;
  }
  setTodos(todos) {
    this.todos = todos;
  }
  getTotalCount() {
    return this.todos.length;
  }
  async addTodo({ title }) {
    interface Item  {
      id: number;
      titel: string;
      isDone: boolean;
      created_at: any;
    }
    const item = {
      id: new Date().getTime(),
      title: title,
      isDone: false,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
    }
    await collection.add(item)
      .then(result => {
        console.log(result);
      })
      .catch(err => console.log(err)
      )
  }
  // addTodo( item ) {
  //   this.todos.push(item);
  // }
}

export class App {
  private todoListModel: any;
  constructor() {
    this.todoListModel = new TodoListModel() 
  }
  async purge() { // 完了分全削除
    
    // const todos = this.todoListModel.getTodos();
    // const newTodos = todos.filter( todo => {
    //   return !todo.isDone
    // });
    // this.todoListModel.setTodos(newTodos);
    await collection.where('isDone', '==', true)
      .get()
      .then(snapshot => {
        snapshot.forEach( doc => {
          collection.doc(doc.id).delete();
        })
      })
      .catch(err => console.log(err))
    this.todoListModel.emit('change'); 
  }
  totalCount() {
    const jsTodoCount = document.querySelector('#js-todo-count');
    const totalCount = this.todoListModel.getTotalCount()
    jsTodoCount.textContent = `TodoItems: ${ totalCount }`
  }
  inputTodo() {
      const jsFormInput: any = document.querySelector('#js-form-input');
      if(!jsFormInput.value.trim()) return

      this.todoListModel.addTodo({ 
        title: jsFormInput.value,
      });
      // this.todoListModel.addTodo( new TodoItemModel({ 
      //   title: jsFormInput.value,
      // }))
      jsFormInput.value = '';
      this.todoListModel.emit('change'); 
  }
  async render() {
    const fs_data = await collection.orderBy("created_at", "desc").get();
    const fs_dataItems = fs_data.docs.map( items => {
      return({
        dbId: items.id,
        id: items.data().id,
        title: items.data().title,
        isDone: items.data().isDone,
        created_at: items.data().created_at,
      })
    })
    this.todoListModel.setTodos(fs_dataItems);
    
    const jsTodoList = document.querySelector('#js-todo-list');
    const jsTodoCount = document.querySelector('#js-todo-count');
    const todos = this.todoListModel.getTodos()
    const totalCount = this.todoListModel.getTotalCount()
    jsTodoCount.textContent = `TodoItems: ${ totalCount }`

    const ul = element`<ul />`
    todos.forEach( todo => {
      const li = todo.isDone 
        ? element`<li><input type="checkbox" class="checkbox" checked/><del>${ todo.title } : ${ todo.isDone } : ${ todo.id}</del><button class="delete">[x]</button></li>`
        : element`<li><input type="checkbox" class="checkbox" />${ todo.title } : ${ todo.isDone } : ${ todo.id}<button class="delete">[x]</button></li>`

      // チェックボックス状態
      const checkboxState = li.querySelector('.checkbox');
      checkboxState.addEventListener('change', async() => {
      //  const todos = this.todoListModel.getTodos();
      //  const item = todos.find( item => {
      //    return item.id === todo.id;
      //  })
      //  item.isDone = !item.isDone
        await collection.doc(todo.dbId).update({
          isDone: !todo.isDone
        })
       this.todoListModel.emit('change');
      })

      // 削除処理
      const deleteBtn = li.querySelector('.delete');
      deleteBtn.addEventListener('click', async() => {

      //  const todos = this.todoListModel.getTodos();
      //  const pos = todos.map( todo => {
      //    return todo.id
      //  }).indexOf(todo.id);
      //  todos.splice(pos, 1)
       
       await collection.doc(todo.dbId).delete();
       this.todoListModel.emit('change');
      })
      
      ul.appendChild(li)
    })
    render(ul,jsTodoList);
  }

  main() {
    const jsForm = document.querySelector('#js-form');
    const purge = document.querySelector('#purge');

    purge.addEventListener('click', () => {
      this.purge();
    })
    // changeリスナー関数
    this.todoListModel.addEventListener('change', () => {
      this.render();
    })  

    jsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.inputTodo();
    });
    this.todoListModel.emit('change');
  }
}
<template>
  <div class="container">
  <header class="header">todos</header>
      <div class="content">
          <span class="icon-down el-icon-arrow-down" 
          v-show="todoLists.length>0" 
          @click="selectAllTodos">
          </span>
          <input type="text" class="todos_add" placeholder="What needs to be done?" 
          @keyup.enter="addTodo($event.target)" 
          ref="currentInput">
          <ul class="content_todoLists">
              <li v-for="(list,index) in todoLists" class="content_todoList" 
              @mouseover="list.isActive = true" 
              @mouseleave="list.isActive=false"
              v-show="defaultShow || (whichShow?list.isChecked:!list.isChecked)">
                  <input type="checkbox" class="checkBox" v-model="list.isChecked">
                  <div class="content_todoList_main" @dblclick="toEdit(list)" v-show="!list.isEditing" :class="{deleted:list.isChecked}">
                      {{list.value}}
                  </div>
                  <input type="text" class="content_todoList_main main_input" 
                  v-model="list.value" 
                  v-show="list.isEditing" 
                  v-todo-focus="list.value"
                  @blur="unEdit(list)">
                  <span class="el-icon-close content_todoList_delete" :class="{show: list.isActive}" @click="deleteTodo(index)"></span>
              </li>
          </ul>
          <div class="data" v-show="todoLists.length>0">
              <div class="data_times" v-show="times === 0">
                  <span>{{times}}</span>
              </div>
              <div class="data_times" v-show="times > 0">
                  <span>{{times}}</span>
              </div>
              <div class="data_status">
                  <a href="#" :class="{active:index === dataStatusIndex}" v-for="(item,index) in dataStatus" @click="switchStatus(index)" :key="index">
                      {{item}}
                  </a>
              </div>
              <div class="data_clearTodos" @click="clearTodos" v-show="times < todoLists.length">
                  <a href="#">clear completed</a>
              </div>
              <div class="data_clearTodos" @click="clearTodos" v-show="times === todoLists.length">
                  <a href="#"></a>
              </div>
          </div>
      </div>
  </div>
</template>
</div>
<script>
import todo_list from '@/todoList'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data(){
        return {
                  todoLists: [],
                  dataStatus: ["All", "Active", "Completed"],
                  dataStatusIndex: 0,
                  whichShow: true,
                  defaultShow: true
            }
  },
  async created() {
      let myStorage = window.localStorage.getItem('content')
      const res = await this.getTodoLists()
      console.log(res)
      this.todoLists =  res|| [] //因为todoLists初始值是null,使用或运算符，如果为null设为空数组
  },
  computed: {
      times() { //使用计算属性计算待办todos的次数 
          let todoArr = this.todoLists
          let times = 0
          for (let i = 0; i < todoArr.length; i++) {
              if (todoArr[i].isChecked === false) {
                  times++
              }
          }
          return times
      }
  },
  methods: {
    async getTodoLists() {
      try {
        const todoLists = await todo_list.getTodoLists()
        return todoLists
        console.log('todoLists',todoLists)
      } catch (error) {
        console.log(error.msg)
        return null
      }
    },
    async getTodoList(id) {
      try {
        const todoList = await todo_list.getTodoList(id)
        return todoList
        console.log('todoList',todoList)
      } catch (error) {
        console.log(error.msg)
        return null
      }
    },
    async addTodoList(info) {
      try {
        const todoList = await todo_list.addTodoList(info)
        return todoList
        console.log('todoList',todoList)
      } catch (error) {
        console.log(error.msg)
        return null
      }
    },
    async editTodoList(id,info) {
      try {
        const todoList = await todo_list.editTodoList(id,info)
        return todoList
        console.log('todoList',todoList)
      } catch (error) {
        console.log(error.msg)
        return null
      }
    },
    async delectTodoList(id) {
      try {
        const todoList = await todo_list.delectTodoList(id)
        return todoList
        console.log('todoList',todoList)
      } catch (error) {
        console.log(error.msg)
        return null
      }
    },
      toEdit(obj) { //使添加的todo可编辑
          obj.isEditing = true
      },
      unEdit(obj) { //使添加的todo不可编辑
          obj.isEditing = false
      },
      async addTodo(e) { //添加todo
          var val = e.value
          if (val === "") {
              return
          } //如果输入内容为空则立即返回
          this.$refs.currentInput.value = "" //按下enter添加todo之后把输入框value清零
          const list_item = { //使用concat这个api添加todo
              value: val, //输入内容
              isEditing: false, //是否在编辑状态
              isActive: false, //删除X图标是否激活
              isChecked: false //是否已完成
          }

          const res = await this.addTodoList(list_item)
          if (res){
             this.todoLists = this.todoLists.concat(list_item)
          }
          // window.localStorage.setItem("content", JSON.stringify(this.todoLists)) //使用localStorage以JSON格式存储数据
      },
      async deleteTodo(index) { //删除todo
          id = this.todoLists[index].id
          await this.delectTodoList(id)
          this.todoLists.splice(index, 1)
          // window.localStorage.setItem("content", JSON.stringify(this.todoLists)) //以json格式存储数据
      },
      switchStatus(index) { //试下下方三个状态切换，略麻烦
          this.dataStatusIndex = index
          if (this.dataStatus[index] === "Active") {
              this.defaultShow = false
              this.whichShow = false
          } else if (this.dataStatus[index] === "Completed") {
              this.defaultShow = false
              this.whichShow = true
          } else if (this.dataStatus[index] === "All") {
              this.defaultShow = true
          }
      },
       clearTodos() { //清空已完成的todoLists
        this.todoLists.forEach(item=>{
          if (item.isChecked){
            this.delectTodoList(item.id)
          }
        })
          this.todoLists = this.todoLists.filter(todo => todo.isChecked === false)
          // window.localStorage.setItem("content", JSON.stringify(this.todoLists)) //以json格式存储数据
      },
      async selectAllTodos() { //设置所有todo为已完成
          this.todoLists.map(todo => {if (todo.isChecked){
            todo.isChecked = false
            this.editTodoList(todo.id,todo)
          } })
      }
  },
  directives: { //自定义focus指令
      "todo-focus": function (el, binding) {
          if (binding.value) {
              el.focus()
          }
      }
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

input {
  outline: none;
}

ul,
li,
ol {
  list-style: none;
}



.header {
  font-size: 48px;
}

.content {
  width: 72%;
  margin: 0 auto;
  box-shadow: 0 3px 3px 2px rgba(0, 0, 0, 0.25);
  position: relative;
}

.icon-down {
  position: absolute;
  font-size: 24px;
  top: 16px;
  left: 16px;
  cursor: pointer;
}

#app .content .todos_add {
  width: 100%;
  height: 56px;
  padding: 16px 56px;
  font-size: 24px;
  border: 1px solid transparent;
}

.content_todoLists {
  position: relative;
  z-index: 3;
}

.content_todoList {
  display: flex;
  flex-direction: row;
  border-top: 1px solid #ccc;
  font-size: 24px;
  padding: 8px;
  background-color: white;
  align-items: center;
}

.checkBox {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

.content_todoList_main {
  flex: 1;
  text-align: left;
  margin-left: 16px;
  font-size: 20px;
  padding: 6px 0;
}

.main_input {
  position: relative;
  z-index: 1;
}

.content_todoList_delete {
  position: absolute;
  right: 16px;
  color: rgb(252, 55, 55);
  font-weight: 500;
  display: none;
  cursor: pointer;
}

.show {
  display: block;
}

.deleted {
  text-decoration-line: line-through;
  color: #bbb;
}

.show:hover {
  color: rgb(255, 0, 0);
  font-weight: 700;
}

::-moz-placeholder {
  color: rgb(221, 218, 218);
}

::-webkit-input-placeholder {
  color: rgb(221, 218, 218);
}

:-ms-input-placeholder {
  color: rgb(221, 218, 218);
}

.data {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  font-size: 14px;
  font-weight: 300;
  color: rgb(145, 145, 145);
}

a {
  text-decoration: none;
  color: rgb(145, 145, 145);
}

.data_times {
  width: 73px;
}

.data_clearTodos {
  width: 142px;
}

.data_status a {
  display: inline-block;
  border: 1px solid transparent;
  border-radius: 2px;
  padding: 1px 4px;
  margin: 0 2px;
}

.data_status a:hover {
  border-color: #bbb;
}

.data_clearTodos a:hover {
  text-decoration-line: underline;
}

.active {
  box-shadow: 0 0 1px black;
}
</style>

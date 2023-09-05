import {useMutation, useQuery} from '@apollo/react-hooks';

import React from 'react';
import {gql} from "apollo-boost";

const GET_TODOS = gql `
  query getTodos {
    todos {
      done
      id
      text
    }
  }
  `;

  const TOGGLE_TODO = gql `
  mutation toggleTodo($id:uuid!, $done: Boolean!) {
    update_todos(where: {id: {_eq: $id}}, _set: {done: $done}) {
      returning {
        done
        id
        text
      }
    }
  }`;

  const ADD_TODO = gql`
  mutation addTodo($text:String!) {
    insert_todos(objects: {text: $text}) {
      returning {
        done
        id
        text
      }
    }
  }`

  const DELETE_TODO = gql`mutation deleteTodo($id:uuid!) {
    delete_todos(where: {id: {_eq: $id}}) {
      returning {
        done
        id
        text
      }
    }
  }`

function App() {
  const [todoText, setTodoText]= React.useState('')
  const {data,loading,error} = useQuery(GET_TODOS)
  const [toggleTodo] = useMutation(TOGGLE_TODO)
  const [addTodo] = useMutation(ADD_TODO, {onCompleted: ()=> setTodoText('')})
  const [deleteTodo] = useMutation(DELETE_TODO)
  
  async function handleDeleteTodo({id}){
    const isConfirmed = window.confirm('Do you want to delete this todo?')
    if(isConfirmed){
      const data = await deleteTodo({
        variables:{id},
        update: cache => {
          const prevData = cache.readQuery ({query: GET_TODOS}) 
          const newTodos = prevData.todos.filter(todo => todo.id !== id)
          cache.writeQuery({query: GET_TODOS, data: {todos:newTodos}})
        } 
      } )
      console.log("deleted todo",data);
    }
  }

  async function handleToggleTodo({id,done}){
    const data = await toggleTodo({ variables: { id: id, done: !done }})
    console.log('toggled todo',data);
  }

  async function handleAddTodo(event){
    event.preventDefault();
    if (!todoText.trim()) return;
    const data = await addTodo({
      variables:{text:todoText},
      refetchQueries: [{query: GET_TODOS}]
    })
    console.log('added todo',data)
    // setTodoText('');
  }

  if (loading) return <div>Loading...</div>
  if (error) return <p>Error : {error.message}</p>;
  return ( 
  <div className="vh-100 code flex-column items-center justify-center bg-light-blue black pa3 fl-1">
    <h1 className="f2-1 tc">GraphQL Checklist{" "}<span role="img" aria-label="Checkmark">✅</span></h1>
    {/* todo form */}
    <form onSubmit={handleAddTodo} className="flex justify-center">
      <input type="text" placeholder="write your todo" onChange={event => setTodoText(event.target.value)} value={todoText} className="pa2 f4 ba b--black br3"></input>
      <button type="submit" className="pa2 ml2 f4 bg-green ba br3">Create</button>
    </form>
    {/* Todo list */}
    <div className="flex items-center justify-center flex-column">
    {
      data.todos.map(todo => (
        <div key={todo.id} className='flex w-70-l w-70-m pa2'>
          <button className="bg-transparent bn f3 br2" onClick={()=>{handleDeleteTodo(todo)}}><span className="dim red">&times;</span></button>
          <input type='checkbox' onChange={() => handleToggleTodo(todo)}></input>
          <div className='inline-flex w-80'>
            <span className={`pointer list pa1 f3 ${todo.done && 'strike'}`}>{todo.text}</span>
          </div>
        </div>
    ))}
    </div>
  </div>);
}

export default App;

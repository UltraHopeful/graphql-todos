import {ApolloClient, ApolloProvider, InMemoryCache, gql} from "@apollo/client";

import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';

const secret = process.env.REACT_APP_HASURA_ADMIN_SECRET

const client = new ApolloClient({ uri : 'https://large-magpie-41.hasura.app/v1/graphql',
cache: new InMemoryCache(),
headers: {
  "x-hasura-admin-secret": secret ,
},})

client.query({
  query: gql `
  query getTodos {
    todos {
      done
      id
      text
    }
  }
  `
}).then(data => console.log(data))

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
  <App />
  </ApolloProvider>
);

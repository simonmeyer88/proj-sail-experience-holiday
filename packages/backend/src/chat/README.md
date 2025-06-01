## Chat Module

This module encapsulates the whole chat functionality of the app.
There are two types of chats: group chats and direct chats.

Both are handled the same way in the database: private chats are handled as group chats with only two members.

There are two 'external facing classes'. The gateway mainly handles websocket (through socket.io) connections, and the controller handles REST API requests.

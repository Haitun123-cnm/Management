// main.js
import { loadClients, saveClients } from './storage.js';

let clients = loadClients();

// 示例：添加一个新客户
function addClient(client) {
  clients.push(client);
  saveClients(clients);
}

// 示例：删除第i个客户
function deleteClient(index) {
  clients.splice(index, 1);
  saveClients(clients);
}

// 你可以在这里继续集成渲染、表单等主逻辑
// window.onload = ... 
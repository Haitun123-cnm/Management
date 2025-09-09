// Cloud storage module using Firebase Firestore
// This replaces localStorage for cross-device sync

class CloudStorage {
  constructor() {
    this.db = window.db;
    this.userId = this.getUserId();
    this.clientsCollection = 'clients';
  }

  // Generate or retrieve user ID for this device
  getUserId() {
    let userId = localStorage.getItem('cloud_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cloud_user_id', userId);
    }
    return userId;
  }

  // Load clients from cloud database
  async loadClients() {
    try {
      if (!this.db) {
        console.warn('Firebase not initialized, falling back to localStorage');
        return this.loadFromLocalStorage();
      }

      const snapshot = await this.db
        .collection(this.clientsCollection)
        .where('userId', '==', this.userId)
        .get();

      const clients = [];
      snapshot.forEach(doc => {
        const clientData = doc.data();
        clientData.id = doc.id; // Store document ID for updates
        clients.push(clientData);
      });

      // Also save to localStorage as backup
      localStorage.setItem('clients', JSON.stringify(clients));
      
      return clients;
    } catch (error) {
      console.error('Error loading from cloud:', error);
      console.log('Falling back to localStorage');
      return this.loadFromLocalStorage();
    }
  }

  // Save clients to cloud database
  async saveClients(clients) {
    try {
      if (!this.db) {
        console.warn('Firebase not initialized, saving to localStorage only');
        this.saveToLocalStorage(clients);
        return;
      }

      // Save to cloud
      const batch = this.db.batch();
      
      // Clear existing clients for this user
      const existingDocs = await this.db
        .collection(this.clientsCollection)
        .where('userId', '==', this.userId)
        .get();
      
      existingDocs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new clients
      clients.forEach(client => {
        const clientData = { ...client, userId: this.userId };
        const docRef = this.db.collection(this.clientsCollection).doc();
        batch.set(docRef, clientData);
      });

      await batch.commit();
      
      // Also save to localStorage as backup
      this.saveToLocalStorage(clients);
      
      console.log('Successfully saved to cloud database');
    } catch (error) {
      console.error('Error saving to cloud:', error);
      console.log('Saving to localStorage as fallback');
      this.saveToLocalStorage(clients);
    }
  }

  // Add a single client to cloud
  async addClient(client) {
    try {
      if (!this.db) {
        console.warn('Firebase not initialized, adding to localStorage only');
        const clients = this.loadFromLocalStorage();
        clients.push(client);
        this.saveToLocalStorage(clients);
        return;
      }

      const clientData = { ...client, userId: this.userId };
      await this.db.collection(this.clientsCollection).add(clientData);
      
      // Also update localStorage
      const clients = this.loadFromLocalStorage();
      clients.push(client);
      this.saveToLocalStorage(clients);
      
      console.log('Successfully added client to cloud');
    } catch (error) {
      console.error('Error adding client to cloud:', error);
      // Fallback to localStorage
      const clients = this.loadFromLocalStorage();
      clients.push(client);
      this.saveToLocalStorage(clients);
    }
  }

  // Update a single client in cloud
  async updateClient(clientId, updatedClient) {
    try {
      if (!this.db) {
        console.warn('Firebase not initialized, updating localStorage only');
        const clients = this.loadFromLocalStorage();
        const index = clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
          clients[index] = { ...updatedClient, id: clientId };
          this.saveToLocalStorage(clients);
        }
        return;
      }

      await this.db
        .collection(this.clientsCollection)
        .doc(clientId)
        .update({ ...updatedClient, userId: this.userId });
      
      // Also update localStorage
      const clients = this.loadFromLocalStorage();
      const index = clients.findIndex(c => c.id === clientId);
      if (index !== -1) {
        clients[index] = { ...updatedClient, id: clientId };
        this.saveToLocalStorage(clients);
      }
      
      console.log('Successfully updated client in cloud');
    } catch (error) {
      console.error('Error updating client in cloud:', error);
      // Fallback to localStorage
      const clients = this.loadFromLocalStorage();
      const index = clients.findIndex(c => c.id === clientId);
      if (index !== -1) {
        clients[index] = { ...updatedClient, id: clientId };
        this.saveToLocalStorage(clients);
      }
    }
  }

  // Delete a client from cloud
  async deleteClient(clientId) {
    try {
      if (!this.db) {
        console.warn('Firebase not initialized, deleting from localStorage only');
        const clients = this.loadFromLocalStorage();
        const filteredClients = clients.filter(c => c.id !== clientId);
        this.saveToLocalStorage(filteredClients);
        return;
      }

      await this.db
        .collection(this.clientsCollection)
        .doc(clientId)
        .delete();
      
      // Also update localStorage
      const clients = this.loadFromLocalStorage();
      const filteredClients = clients.filter(c => c.id !== clientId);
      this.saveToLocalStorage(filteredClients);
      
      console.log('Successfully deleted client from cloud');
    } catch (error) {
      console.error('Error deleting client from cloud:', error);
      // Fallback to localStorage
      const clients = this.loadFromLocalStorage();
      const filteredClients = clients.filter(c => c.id !== clientId);
      this.saveToLocalStorage(filteredClients);
    }
  }

  // Fallback methods for localStorage
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('clients');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return [];
    }
  }

  saveToLocalStorage(clients) {
    try {
      localStorage.setItem('clients', JSON.stringify(clients));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  // Real-time sync listener
  onClientsChange(callback) {
    if (!this.db) {
      console.warn('Firebase not initialized, real-time sync not available');
      return null;
    }

    try {
      return this.db
        .collection(this.clientsCollection)
        .where('userId', '==', this.userId)
        .onSnapshot(snapshot => {
          const clients = [];
          snapshot.forEach(doc => {
            const clientData = doc.data();
            clientData.id = doc.id;
            clients.push(clientData);
          });
          
          // Update localStorage
          this.saveToLocalStorage(clients);
          
          // Call the callback with updated data
          callback(clients);
        });
    } catch (error) {
      console.error('Error setting up real-time sync:', error);
      return null;
    }
  }
}

// Export for use in other files
window.CloudStorage = CloudStorage;


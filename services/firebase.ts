
const DB_URL = "https://studio-9150179435-2a470-default-rtdb.asia-southeast1.firebasedatabase.app";
export const ADMIN_EMAIL = "henhendrazat@gmail.com";

export interface UserData {
  id: string;
  email: string;
  username: string;
  password?: string;
  createdAt: number;
  bio?: string;
  followersCount?: number;
  likesCount?: number;
  isBanned?: boolean;
  isAdmin?: boolean;
  profilePic?: string;
  musicUrl?: string;
  aiApiKey?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private';
  ownerId: string;
  accessCode?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  profilePic?: string;
  text: string;
  image?: string;
  audio?: string;
  timestamp: number;
  isEdited?: boolean;
  isAi?: boolean;
  channelId: string;
}

export interface Presence {
  userId: string;
  username: string;
  lastSeen: number;
}

export const firebaseService = {
  async registerUser(email: string, username: string, password?: string): Promise<UserData | null> {
    try {
      const id = btoa(email).replace(/[^a-zA-Z0-9]/g, "");
      const userData: UserData = { 
        id, email, username, password, createdAt: Date.now(), 
        followersCount: 0, likesCount: 0, isBanned: false,
        isAdmin: email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
        profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        musicUrl: '',
        bio: 'Active Scalper Node.',
        aiApiKey: ''
      };
      await fetch(`${DB_URL}/users/${id}.json`, { method: 'PUT', body: JSON.stringify(userData) });
      return userData;
    } catch (error) { return null; }
  },

  async loginUser(email: string, password?: string): Promise<{user: UserData | null, error?: string}> {
    try {
      const id = btoa(email).replace(/[^a-zA-Z0-9]/g, "");
      const response = await fetch(`${DB_URL}/users/${id}.json`);
      const user: UserData = await response.json();
      if (!user) return { user: null, error: "Identity not found." };
      if (user.isBanned) return { user: null, error: "ACCESS DENIED: Identity terminated." };
      if (password && user.password !== password) return { user: null, error: "Invalid access key." };
      return { user };
    } catch (error) { return { user: null, error: "Quantum link failure." }; }
  },

  async getUserById(id: string): Promise<UserData | null> {
    const response = await fetch(`${DB_URL}/users/${id}.json`);
    return response.json();
  },

  async getAllUsers(): Promise<UserData[]> {
    const response = await fetch(`${DB_URL}/users.json`);
    const data = await response.json();
    return data ? Object.values(data) : [];
  },

  async toggleUserBan(userId: string, status: boolean): Promise<void> {
    await fetch(`${DB_URL}/users/${userId}/isBanned.json`, { method: 'PUT', body: JSON.stringify(status) });
  },

  async checkInteraction(userId: string, targetId: string, type: 'likes' | 'follows'): Promise<boolean> {
    const response = await fetch(`${DB_URL}/interactions/${type}/${userId}/${targetId}.json`);
    const exists = await response.json();
    return !!exists;
  },

  async likeUser(userId: string, targetId: string): Promise<number> {
    if (userId === targetId) return -1;
    const alreadyLiked = await this.checkInteraction(userId, targetId, 'likes');
    if (alreadyLiked) return -1;
    await fetch(`${DB_URL}/interactions/likes/${userId}/${targetId}.json`, { method: 'PUT', body: JSON.stringify(true) });
    const user = await this.getUserById(targetId);
    const newCount = (user?.likesCount || 0) + 1;
    await fetch(`${DB_URL}/users/${targetId}/likesCount.json`, { method: 'PUT', body: JSON.stringify(newCount) });
    return newCount;
  },

  async followUser(userId: string, targetId: string): Promise<number> {
    if (userId === targetId) return -1;
    const alreadyFollowed = await this.checkInteraction(userId, targetId, 'follows');
    if (alreadyFollowed) return -1;
    await fetch(`${DB_URL}/interactions/follows/${userId}/${targetId}.json`, { method: 'PUT', body: JSON.stringify(true) });
    const user = await this.getUserById(targetId);
    const newCount = (user?.followersCount || 0) + 1;
    await fetch(`${DB_URL}/users/${targetId}/followersCount.json`, { method: 'PUT', body: JSON.stringify(newCount) });
    return newCount;
  },

  async createChannel(channel: Omit<Channel, 'id'>): Promise<Channel> {
    const id = Math.random().toString(36).substring(2, 9);
    const newChannel = { ...channel, id };
    await fetch(`${DB_URL}/channels/${id}.json`, { method: 'PUT', body: JSON.stringify(newChannel) });
    return newChannel;
  },

  async getChannels(): Promise<Channel[]> {
    const response = await fetch(`${DB_URL}/channels.json`);
    const data = await response.json();
    return data ? Object.values(data) : [];
  },

  async sendChatMessage(msg: Omit<ChatMessage, 'id'>): Promise<void> {
    await fetch(`${DB_URL}/chat/${msg.channelId}.json`, {
      method: 'POST',
      body: JSON.stringify(msg)
    });
  },

  async getChatMessages(channelId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${DB_URL}/chat/${channelId}.json`);
    const data = await response.json();
    if (!data) return [];
    return Object.keys(data).map(key => ({ ...data[key], id: key })).sort((a, b) => a.timestamp - b.timestamp);
  },

  async deleteChatMessage(channelId: string, msgId: string): Promise<void> {
    await fetch(`${DB_URL}/chat/${channelId}/${msgId}.json`, { method: 'DELETE' });
  },

  async editChatMessage(channelId: string, msgId: string, text: string): Promise<void> {
    await fetch(`${DB_URL}/chat/${channelId}/${msgId}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ text, isEdited: true })
    });
  },

  async updatePresence(channelId: string, userId: string, username: string): Promise<void> {
    await fetch(`${DB_URL}/presence/${channelId}/${userId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ userId, username, lastSeen: Date.now() })
    });
  },

  async getActiveMembers(channelId: string): Promise<Presence[]> {
    try {
      const response = await fetch(`${DB_URL}/presence/${channelId}.json`);
      const data = await response.json();
      if (!data) return [];
      const now = Date.now();
      return Object.values(data as Record<string, Presence>).filter(p => now - p.lastSeen < 15000);
    } catch(e) { return []; }
  },

  async updateUsername(id: string, username: string): Promise<boolean> {
    await fetch(`${DB_URL}/users/${id}/username.json`, { method: 'PUT', body: JSON.stringify(username) });
    return true;
  },

  async updatePassword(id: string, password: string): Promise<boolean> {
    await fetch(`${DB_URL}/users/${id}/password.json`, { method: 'PUT', body: JSON.stringify(password) });
    return true;
  },

  async updateProfileMedia(id: string, profilePic: string, musicUrl: string, bio: string, aiApiKey: string): Promise<boolean> {
    await fetch(`${DB_URL}/users/${id}.json`, { method: 'PATCH', body: JSON.stringify({ profilePic, musicUrl, bio, aiApiKey }) });
    return true;
  }
};

import type { ModelPrediction as MLPrediction } from './ml/types.js';

interface User {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  stats: {
    followers: number;
    following: number;
    totalBets: number;
    winningBets: number;
    roi: number;
    winStreak: number;
    largestWin: number;
    reputation: number;
  };
  preferences: {
    favoriteSports: string[];
    notifications: boolean;
    privateProfile: boolean;
  };
}

interface Post {
  id: string;
  userId: string;
  content: string;
  prediction?: MLPrediction;
  timestamp: number;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  visibility: 'public' | 'followers' | 'private';
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  timestamp: number;
  likes: number;
  replies: number;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  roi: number;
  totalBets: number;
  winRate: number;
  streak: number;
  rank: number;
}

class SocialFeaturesService {
  private static instance: SocialFeaturesService;
  private users: Map<string, User> = new Map();
  private posts: Map<string, Post> = new Map();
  private comments: Map<string, Comment> = new Map();
  private followers: Map<string, Set<string>> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();

  private constructor() {}

  static getInstance(): SocialFeaturesService {
    if (!SocialFeaturesService.instance) {
      SocialFeaturesService.instance = new SocialFeaturesService();
    }
    return SocialFeaturesService.instance;
  }

  // User Management
  async createUser(username: string, avatar?: string, bio?: string): Promise<User> {
    const user: User = {
      id: `user_${Date.now()}`,
      username,
      avatar,
      bio,
      stats: {
        followers: 0,
        following: 0,
        totalBets: 0,
        winningBets: 0,
        roi: 0,
        winStreak: 0,
        largestWin: 0,
        reputation: 0,
      },
      preferences: {
        favoriteSports: [],
        notifications: true,
        privateProfile: false,
      },
    };

    this.users.set(user.id, user);
    this.followers.set(user.id, new Set());
    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Following System
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (!this.users.has(followerId) || !this.users.has(followingId)) {
      return false;
    }

    const followers = this.followers.get(followingId);
    if (!followers) return false;

    followers.add(followerId);
    const user = this.users.get(followingId);
    if (user) {
      user.stats.followers++;
      this.users.set(followingId, user);
    }

    const follower = this.users.get(followerId);
    if (follower) {
      follower.stats.following++;
      this.users.set(followerId, follower);
    }

    return true;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const followers = this.followers.get(followingId);
    if (!followers) return false;

    const success = followers.delete(followerId);
    if (success) {
      const user = this.users.get(followingId);
      if (user) {
        user.stats.followers--;
        this.users.set(followingId, user);
      }

      const follower = this.users.get(followerId);
      if (follower) {
        follower.stats.following--;
        this.users.set(followerId, follower);
      }
    }

    return success;
  }

  // Posts and Comments
  async createPost(
    userId: string,
    content: string,
    prediction?: MLPrediction,
    visibility: 'public' | 'followers' | 'private' = 'public',
    tags: string[] = []
  ): Promise<Post | null> {
    if (!this.users.has(userId)) return null;

    const post: Post = {
      id: `post_${Date.now()}`,
      userId,
      content,
      prediction,
      timestamp: Date.now(),
      likes: 0,
      comments: 0,
      shares: 0,
      tags,
      visibility,
    };

    this.posts.set(post.id, post);
    return post;
  }

  async addComment(postId: string, userId: string, content: string): Promise<Comment | null> {
    if (!this.posts.has(postId) || !this.users.has(userId)) return null;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      userId,
      content,
      timestamp: Date.now(),
      likes: 0,
      replies: 0,
    };

    this.comments.set(comment.id, comment);
    const post = this.posts.get(postId);
    if (post) {
      post.comments++;
      this.posts.set(postId, post);
    }

    return comment;
  }

  // Engagement
  async likePost(postId: string, _userId: string): Promise<boolean> {
    const post = this.posts.get(postId);
    if (!post) return false;

    post.likes++;
    this.posts.set(postId, post);
    return true;
  }

  async sharePost(postId: string, _userId: string): Promise<boolean> {
    const post = this.posts.get(postId);
    if (!post) return false;

    post.shares++;
    this.posts.set(postId, post);
    return true;
  }

  // Leaderboards
  async getLeaderboard(timeframe: 'day' | 'week' | 'month' | 'all'): Promise<LeaderboardEntry[]> {
    const cacheKey = `leaderboard_${timeframe}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as LeaderboardEntry[];

    const entries: LeaderboardEntry[] = Array.from(this.users.values())
      .map(user => ({
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        roi: user.stats.roi,
        totalBets: user.stats.totalBets,
        winRate: user.stats.winningBets / user.stats.totalBets,
        streak: user.stats.winStreak,
        rank: 0,
      }))
      .sort((a, b) => b.roi - a.roi);

    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    this.setCache(cacheKey, entries);
    return entries;
  }

  // Feed
  async getFeed(userId: string, page: number = 1, pageSize: number = 10): Promise<Post[]> {
    const user = this.users.get(userId);
    if (!user) return [];

    const followers = this.followers.get(userId);
    if (!followers) return [];

    const allPosts = Array.from(this.posts.values())
      .filter(post => {
        if (post.visibility === 'public') return true;
        if (post.visibility === 'followers') return followers.has(post.userId);
        return post.userId === userId;
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return allPosts.slice(start, end);
  }

  // Cache Management
  /**
   * Get a value from the cache, typed.
   */
  /**
   * Get a value from the cache, type-safe.
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key) as { data: T; timestamp: number } | undefined;
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  /**
   * Set a value in the cache, typed.
   */
  /**
   * Set a value in the cache, type-safe.
   */
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

export const socialFeatures = SocialFeaturesService.getInstance();

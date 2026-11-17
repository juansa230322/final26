/**
 * ================================================================
 * CLASE: ForumComment
 * ================================================================
 * Modela un comentario individual dentro de una publicación.
 */
class ForumComment {
  constructor({ id, author, authorId = null, role = 'Ciudadano', avatar = '', date = 'Hace un momento', text, createdAt = null }) {
    this.id = id || `comm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.author = author;
    this.authorId = authorId;
    this.role = role;
    this.avatar = avatar;
    this.date = date;
    this.text = text;
    this.createdAt = createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      author: this.author,
      authorId: this.authorId,
      role: this.role,
      avatar: this.avatar,
      date: this.date,
      text: this.text,
      createdAt: this.createdAt
    };
  }
}

/**
 * ================================================================
 * CLASE: ForumPost
 * ================================================================
 * Modela una publicación comunitaria y científica con comentarios, me gusta y moderación.
 */
class ForumPost {
  constructor({
    id,
    author,
    authorId = null,
    avatar,
    role = 'Ciudadano',
    category = 'Conservación',
    date = 'Hace un momento',
    title,
    content,
    image = null,
    likes = 0,
    likedByUserIds = [],
    isPinned = false,
    isEdited = false,
    isScientific = false,
    comments = [],
    createdAt = null
  }) {
    this.id = id || `post-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.author = author;
    this.authorId = authorId;
    this.avatar = avatar;
    this.role = role;
    this.category = category;
    this.date = date;
    this.title = title;
    this.content = content;
    this.image = image;
    this.likes = Number(likes) || 0;
    this.likedByUserIds = [...(likedByUserIds || [])];
    this.isPinned = Boolean(isPinned);
    this.isEdited = Boolean(isEdited);
    this.isScientific = Boolean(isScientific) || category === 'Investigación Científica';
    this.comments = (comments || []).map(c => (c instanceof ForumComment ? c : new ForumComment(c)));
    this.createdAt = createdAt || new Date().toISOString();
  }

  addComment(commentData) {
    const comment = commentData instanceof ForumComment ? commentData : new ForumComment(commentData);
    this.comments.push(comment);
    return comment;
  }

  removeComment(index) {
    if (index >= 0 && index < this.comments.length) {
      this.comments.splice(index, 1);
      return true;
    }
    return false;
  }

  toggleLike(userId = null) {
    if (userId) {
      const idx = this.likedByUserIds.indexOf(userId);
      if (idx !== -1) {
        this.likedByUserIds.splice(idx, 1);
        this.likes = Math.max(0, this.likes - 1);
      } else {
        this.likedByUserIds.push(userId);
        this.likes += 1;
      }
    } else {
      this.likes += 1;
    }
    return this.likes;
  }

  isLikedBy(userId) {
    if (!userId) return false;
    return this.likedByUserIds.includes(userId);
  }

  togglePin() {
    this.isPinned = !this.isPinned;
    return this.isPinned;
  }

  edit({ title, content, category }) {
    if (title) this.title = title;
    if (content) this.content = content;
    if (category) {
      this.category = category;
      this.isScientific = category === 'Investigación Científica';
    }
    this.isEdited = true;
  }

  toJSON() {
    return {
      id: this.id,
      author: this.author,
      authorId: this.authorId,
      avatar: this.avatar,
      role: this.role,
      category: this.category,
      date: this.date,
      title: this.title,
      content: this.content,
      image: this.image,
      likes: this.likes,
      likedByUserIds: this.likedByUserIds,
      isPinned: this.isPinned,
      isEdited: this.isEdited,
      isScientific: this.isScientific,
      comments: this.comments.map(c => c.toJSON()),
      createdAt: this.createdAt
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ForumPost, ForumComment };
}

// MongoDB initialization script
db = db.getSiblingDB('summary-app');

// Create collections
db.createCollection('users');
db.createCollection('sources');
db.createCollection('articles');
db.createCollection('summaries');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "interests": 1 });

db.sources.createIndex({ "name": 1 }, { unique: true });
db.sources.createIndex({ "rssFeedUrl": 1 });

db.articles.createIndex({ "url": 1 }, { unique: true });
db.articles.createIndex({ "source": 1 });
db.articles.createIndex({ "categories": 1 });
db.articles.createIndex({ "isSummarized": 1 });
db.articles.createIndex({ "publishedAt": -1 });

db.summaries.createIndex({ "article": 1 }, { unique: true });
db.summaries.createIndex({ "keywords": 1 });
db.summaries.createIndex({ "createdAt": -1 });

print('MongoDB initialized with collections and indexes');
var CommentModel = Backbone.Model.extend({
  validate: function(attrs){
    if( !attrs.email ){
      return 'Email address is required';
    }

    if( !attrs.content ){
      return 'You have to say something in your comment';
    }
  }
});

var CommentsCollection = Backbone.Collection.extend({
  model: CommentModel
});

var commentTemplate = _.template('<header>Posted by <span class="author-email"><a href=""><%= model.get("email") %></a></span> <span class="date"><%= model.get("created_at") %></span></header><div class="comment-content"><%= renderMarkdown() %></div>');

var CommentView = Backbone.View.extend({

  tagName: 'li',
  
  template: commentTemplate,

  initialize: function(){
    if( !this.model ){
      throw new Error('You must provide a Comment model');
    }

    this.listenTo( this.model, 'remove', this.remove);
  },

  render: function(){
    this.$el.html( this.template( this ) );
    return this.$el;
  },

  renderMarkdown: function(){
    return markdown.toHTML( this.model.get('content') );
  }

});

var CommentsApp = Backbone.View.extend({

  el: $('.comments'),

  initialize: function(){
    this.collection = new CommentsCollection();
    this.listenTo( this.collection, 'add', this.renderComment );
    this.listenTo( this.collection, 'remove', this.renderCommentCount );
  },

  renderComment: function(model){
    model.view = new CommentView({ model: model });
    this.$('#comment-list').prepend( model.view.render() );
    this.resetFormFields();
    this.renderCommentCount();
  },

  resetFormFields: function(){
    this.$('form textarea, form input[name="email"]').val(null);
  },

  renderCommentCount: function(){
    var length = this.collection.length;
    var count = length === 1 ? '1 Comment' : length + ' Comments';
    this.$('.comment-count').text( count );
  },

  events: {
    'submit form': 'createComment'
  },

  createComment: function(event){
    event.preventDefault();

    // Create a new Comment Model with the data in the form
    var comment = {
      content: this.$('form textarea').val(),
      email: this.$('form input[name="email"]').val(),
      created_at: +new Date()
    };
    // The `validate` option ensures that empty comments aren't added
    this.collection.add( comment, { validate: true });
  }

});

$(function(){
  window.comments = new CommentsApp();
});
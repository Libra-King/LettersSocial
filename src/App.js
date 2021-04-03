import React, { Component } from 'react';
import ProTypes from 'pro-types';
import parseLinkHeader from 'parse-link-header';
import orderBy from 'lodash/orderBy';

import ErrorMessage from './components/error/Error';
import Loader from './components/Loader';
import * as API from './shared/http';
import Ad from './component/ad/Ad';
import Navbar from './component/nav/navbar';
import Welcome from './component/welcome/Welcome';
import Post from './components/post/Post';
import CreatePost from './components/post/Create';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      loading: false,
      posts: [],
      endpoint: `${process.env.ENDPOINT}/posts?_page=1&_sort=date&_order=DESC&_embed=comments&_expand=user&_embed=likes`
    };

    this.getPosts = this.getPosts.bind(this);
  }

  static propTypes = {
    children: PropTypes.node
  };

  componentDidMount () {
    this.getPosts();  // 当组件加载时获取帖子
  }

  componentDidCatch (err, info) {
    console.error(err);
    console.error(info);

    this.setState(() => ({
      error: err
    }));
  }

  getPosts () {
    API.fetchPosts(this.state.endpoint).then(res => {
      return res.json().then(posts => {
        const links = parseLinkHeader(res.headers.get('Link'));

        this.setState(() => ({
          posts: orderBy(this.state.posts.concat(posts), 'date', 'desc'),
          endpoint: links.next.url
        }));
      }).catch(err => {
        this.setState(() => ({ error: err }));
      });
    });
  }

  createNewPos (post) {
    return API.createPost(post).then(res => res.json()).then(newPost => {
      this.setState(prevState => {
        return {
          posts: orderBy(prevState.posts.concat(newPost), 'date', 'desc')
        };
      });
    }).catch(err => {
      this.setState(() => ({ error: err }));
    });
    // this.setState(prevState => {
    //   return {
    //     posts: orderBy(prevState.posts.concat(newPost), 'date', 'desc')
    //   };
    // });
  }

  render () {
    return (
      <div className="app">
        <Navbar />
        {this.state.loading ? (
          <div className="loading">
            <Loader />
          </div>
        ) : (
          <div className="home">
            <Welcome />
            <CreatePost onSubmit={this.createNewPos} />
            <div>
              {this.state.posts.length && (
                <div className="posts">
                  {this.state.posts.map(({ id }) => (
                    <Post id={id} key={id} user={this.props.user} />
                  ))}
                </div>
              )}
              <button className="block">Load more posts</button>
            </div>
            <div>
              <Ad url="https://ifelse.io/book" imageUrl="/static/assets/ads/ria.png" />
              <Ad url="https://ifelse.io/book" imageUrl="/static/assets/ads/orly.jpg" />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Filter from 'bad-words';

// const filter = new Filter();

class CreatePost extends Component {
  static propTypes = {};

  constructor(props) {
    super(props);

    this.initialState = {
      content: '',
      valid: false,
      showLocationPicker: false,
      location: {
        lat: 34.1535641,
        lng: -118.1428115,
        name: null
      },
      locationSelected: false
    };

    this.state = this.initialState;
    this.filter = new Filter();

    // set up event handlers
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePostChange = this.handlePostChange.bind(this);
    this.handleRemoveLocation = this.handleRemoveLocation.bind(this);
    this.handleToggleLocation = this.handleToggleLocation.bind(this);
    this.onLocationSelect = this.onLocationSelect.bind(this);
    this.onLocationUpdate = this.onLocationUpdate.bind(this);
    this.renderLocationControls = this.renderLocationControls.bind(this);  // 子渲染
  }

  handlePostChange (event) {
    // console.log('Handling an update to the post dody!');
    const content = filter.clean(event.target.value);

    this.setState(() => {
      return {
        content,
        valid: content.length <= 280
      };
    });
  }

  fetchPosts () { }

  handleSubmit () {
    // console.log('Handling submission!');
    // event.preventDefault();

    if (!this.state.valid) {
      return;
    }

    const newPost = {
      content: this.state.content
    };

    if (this.state.locationSelected) {
      newPost.location = this.state.location;
    }

    this.props.onSubmit(newPost);

    this.setState(() => ({
      content: '',
      valid: false,
      showLocationPicker: false,
      location: this.initialState.location,
      locationSelected: false
    }));

    // if (this.props.onSubmit) {
    //   const newPost = {
    //     date: Date.now(),
    //     // Assign a temporary key to the post;the API will create a real one for upTask.abort();
    //     id: Date.now(),
    //     content: this.state.content
    //   };

    //   this.props.onSubmit(newPost);
    //   this.setState({
    //     content: '',
    //     valid: null
    //   });
    // }
  }

  // 允许用户从他们的帖子中删除位置
  handleRemoveLocation () {
    this.setState(() => ({
      locationSelected: false,
      location: this.initialState.location
    }));
  }

  onLocationUpdate (location) {
    this.setState(() => ({ location }));
  }

  onLocationSelect (location) {
    this.setState(() => ({
      location,
      showLocationPicker: false,
      locationSelected: true
    }));
  }

  handleToggleLocation (e) {
    e.preventDefault();
    this.setState(() => ({
      showLocationPicker: !this.state.showLocationPicker
    }));
  }

  // 子渲染
  renderLocationControls () {
    return (
      <div className="controls">
        <button onClick={this.handleSubmit}>Post</button>
        {this.state.location && this.state.locationSelected ? (
          <button onClick={this.handleRemoveLocation} className="open location-indicator">
            <i className="fa-location-arrow fa" />
            <small>{this.state.location.name}</small>
          </button>
        ) : (
          <button onClick={this.handleToggleLocation} className="open">
            {this.state.showLocationPicker ? 'Cancel' : 'Add location'}{' '}
            <i className={classnames(`fa`, {
              'fa-map-o': !this.state.showLocationPicker,
              'fa-times': this.state.showLocationPicker
            })} />
          </button>
        )}
      </div>
    );
  }

  render () {
    return (
      <div className="create-post">
        {/* <button onClick={this.handleSubmit}>Post</button> */}
        <textarea value={this.state.content} onChange={this.handlePostChange} placeholder="What's on your mind?" />
        {/* 调用子渲染方法 */}
        {this.renderLocationControls()}

        <div className="location-picker" style={{ display: this.state.showLocationPicker ? 'block' : 'none' }}>
          {!this.state.locationSelected && [
            <LocationTypeAhead key="LocationTypeAhead" onLocationSelect={this.onLocationSelect} onLocationUpdate={this.onLocationUpdate} />,
            <DisplayMap key="DisplayMap" displayOnly={false} location={this.state.location} onLocationSelect={this.onLocationSelect} onLocationUpdate={this.onLocationUpdate} />
          ]}
        </div>
      </div>
    );
  }
}

export default CreatePost;
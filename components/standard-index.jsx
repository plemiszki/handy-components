import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import { fetchEntities } from '../actions/index';
// import Modal from 'react-modal';
import HandyTools from 'handy-tools';
import _ from 'lodash';
// import Index from './modules/index.js';
// import Common from './modules/common.js';
// import TabActions from './modules/tab-actions.js';
// import NewEntity from './new-entity.jsx';
// import Message from './message.jsx';

// const directory = window.location.pathname.split('/')[1] || 'quizzes';

export default class StandardIndex extends React.Component {
  constructor(props) {
    super(props);

    let initialState = {
      fetching: true,
      entities: [],
      // searchProperty: this.props.columns[0],
      searchText: '',
      newEntityModalOpen: false
    }

    this.state = initialState;
  }

  componentDidMount() {
    console.log('comp did mount');
    // Common.checkForMessage.call(this);
    // this.props.fetchEntities(directory).then(() => {
    //   let entityArray;
    //   if (this.props.tabs) {
    //     entityArray = `entities${HandyTools.capitalize(this.state.tab)}`;
    //   } else {
    //     entityArray = 'entities';
    //   }
    //   this.setState({
    //     fetching: false,
    //     [entityArray]: this.props.entities
    //   });
    // });
  }

  updateIndex(entities) {
    // if (this.props.tabs) {
    //   this.setState({
    //     newEntityModalOpen: false,
    //     [`entities${HandyTools.capitalize(this.props.newEntityTab)}`]: entities
    //   });
    // } else {
    //   this.setState({
    //     newEntityModalOpen: false,
    //     entities: entities
    //   });
    // }
  }

  render() {
    return(
      <div className="component">
        standard index
      </div>
    );
  }

  componentDidUpdate() {
    // Common.matchColumnHeight();
  }
}

// const mapStateToProps = (reducers) => {
//   return {
//     entities: reducers.standardReducer.entities
//   };
// };
//
// function mapDispatchToProps(dispatch) {
//   return bindActionCreators({ fetchEntities }, dispatch);
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(StandardIndex);

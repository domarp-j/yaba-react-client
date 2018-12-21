import React from 'react';
import PropTypes from 'prop-types';
import { Button, Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';

class SaveIndicator extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isEditingTransaction: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = { showLoader: false };
  }

  componentDidUpdate() {
    if (this.props.isEditingTransaction && !this.state.showLoader) {
      this.setState({ showLoader: true });

      setTimeout(() => {
        this.setState({ showLoader: false });
      }, 800);
    }
  }

  render() {
    return (
      this.state.showLoader &&
        <Menu.Item>
          <Button
            {...this.props}
            className={`no-padding no-margin ${this.props.className}`}
            loading
          />
        </Menu.Item>
    );
  }
}

const mapStateToProps = state => ({
  isEditingTransaction: state.transactions.boolEvents.isEditingTransaction,
});

export default connect(mapStateToProps)(SaveIndicator);

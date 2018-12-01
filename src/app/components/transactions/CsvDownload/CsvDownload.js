import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Segment } from 'semantic-ui-react';

import yabaAxios from '../../../utils/yabaAxios';
import routes from '../../../routes';

class CsvDownload extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  downloadCsv = () => {
    this.setState({ loading: true });
    yabaAxios.get(routes.downloadCsv, {
      headers: {
        Accept: 'text/csv; charset=utf-8',
        'Content-Type': 'text/csv; charset=utf-8',
      },
    })
      .then(res => {
        this.generateCsvFile(res.data);
      })
      // TODO: Catch & display error
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  generateCsvFile = data => {
    const element = document.createElement('a');
    const csv = new Blob([data], { type: 'text/plain' });
    element.href = URL.createObjectURL(csv);
    element.download = 'transactions.csv';
    element.click();
  }

  render() {
    return (
      <Segment className='padding-30'>
        <h3>
            Download your transactions as a CSV
        </h3>

        <p>
            By clicking <b>Download</b>, you will receive a CSV file containing of all your
            transactions, including their descriptions, dates, amounts, and tags. You will
            have a copy of your transactions data for safekeeping. Feel free to use it to
            get your own custom statistics!
        </p>

        <Button
          className='full-width-mobile margin-top-15'
          icon
          labelPosition='left'
          loading={this.state.loading}
          onClick={this.downloadCsv}
        >
          <Icon name='download' />
            Download
        </Button>

        <br />

        <Button
          className='full-width-mobile margin-top-15'
          content='Cancel'
          onClick={e => { e.preventDefault(); this.props.onCancel(); }}
          size='large'
        />
      </Segment>
    );
  }
}

export default CsvDownload;

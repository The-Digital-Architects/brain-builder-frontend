import React from 'react'
import './css/App.css';
import { Theme, Flex, Box, Tabs, Heading, IconButton, Separator, Checkbox, Text } from '@radix-ui/themes';
import CodePreview from './code_preview/codePreview';
import layersToCode from './code_preview/codeExplainTools';
import Header from './common/header';

class Building extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        currentSlide: 0,
        activeTab: 'building',
        showCode: false,
        code: '',
        printedDescription: ''
      };
    }
}




function Wrapper(props) {
    const navigate = useNavigate();
  
    return <View {...props} navigate={navigate} />;
  }

export default Wrapper;
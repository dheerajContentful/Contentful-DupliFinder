import React, {useState} from 'react';
import { Stack, Button, Caption, Paragraph, TextLink } from '@contentful/f36-components';
import { SidebarAppSDK } from '@contentful/app-sdk';
import {  useSDK } from '@contentful/react-apps-toolkit';
import { createClient } from 'contentful-management'
import { List, ListItem, Note } from '@contentful/f36-components';

const Sidebar = () => {
  
  const sdk = useSDK();
  sdk.window.startAutoResizer();

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [showDisplay, setDisplay] = useState(false);
  const [entries, setEntries] = useState([]);  
  const [showNoDuplicates, SetNoDuplicates] = useState(false);
  const [entryTitle, setEntryTitle] = useState("title");

  const checkDuplicates    = async () => {

    setLoading(true);
    setDisabled(true);

    const displayField = sdk.contentType.displayField;
    setEntryTitle(displayField);
    if(displayField != null)
    {
      const currentEntryDisplayFieldValue = sdk.entry.fields[displayField].getValue();
      
      if(currentEntryDisplayFieldValue != null) 
      {
        const queryObject = {
            content_type: sdk.contentType.sys.id,
        };
  
  // Assuming currentEntryDisplayFieldValue is a variable holding the value for dynamic field matching
  queryObject[`fields.${displayField}[match]`] = currentEntryDisplayFieldValue;
  
  const entries = await sdk.cma.entry.getMany({
      query: queryObject
  });
  
  const filteredEntries = entries.items.filter(entry => entry.sys.id !== sdk.ids.entry);

    setLoading(false);
    setDisabled(false);

    if(filteredEntries.length > 0 )
    {
      setDisplay(true);
      SetNoDuplicates(false);
      setEntries(filteredEntries);
    }
    else{
      setDisplay(false);
      SetNoDuplicates(true);
    }
      }
    }
   };

   function formatDate(dateString) {
    const date = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - date.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (dayDiff === 0) {
        return 'Today';
    } else if (dayDiff === 1) {
        return 'Yesterday';
    } else {
        return dayDiff + ' days ago';
    }
}
 
 return (<Stack alignItems="start" flexDirection="column" spacing="spacingS">
  <Button
    variant="primary"
    isLoading={isLoading}
    isDisabled={isDisabled}
    onClick={checkDuplicates}
  >
    Check Duplicates
  </Button>
  

      <Note variant='warning' style={{ display: showDisplay === true ? 'block' : 'none' }} >
        Duplicates identified:
        <ul>
   {
      entries.map(item => {
         return <li key={item.sys.id}> <TextLink onClick={() => {sdk.navigator.openEntry(item.sys.id);} }> {item.fields[entryTitle][sdk.locales.default]} - updated { formatDate(item.sys.updatedAt) }</TextLink> </li>
      })
   }
       
          
          
        </ul>
      </Note>

      <Note variant='positive' style={{ display: showNoDuplicates === true ? 'block' : 'none' }} >
        No duplicates identified.
      </Note>

</Stack>
);

};

export default Sidebar;

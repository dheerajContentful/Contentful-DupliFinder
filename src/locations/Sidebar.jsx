import React, { useState, useEffect } from 'react';
import { Stack, Button, Note, TextLink } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';


const Sidebar = () => {
  const sdk = useSDK();
  sdk.window.startAutoResizer();

  const [isLoading, setLoading] = useState(false);
  const [showDisplay, setShowDisplay] = useState(false);
  const [showNoDuplicates, setShowNoDuplicates] = useState(false);
  const [entries, setEntries] = useState([]);
  const [entryTitle, setEntryTitle] = useState("title");

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);

      const displayField = sdk.contentType.displayField;
      if (!displayField) return;
      setEntryTitle(displayField);

      const currentEntryDisplayFieldValue = sdk.entry.fields[displayField].getValue();
      if (!currentEntryDisplayFieldValue) return;

      const queryObject = {
        content_type: sdk.contentType.sys.id,
        [`fields.${displayField}[match]`]: currentEntryDisplayFieldValue
      };

      try {
        const entries = await sdk.cma.entry.getMany({ query: queryObject });
        const filteredEntries = entries.items.filter(entry => entry.sys.id !== sdk.ids.entry);

        setLoading(false);

        if (filteredEntries.length > 0) {
          setShowDisplay(true);
          setShowNoDuplicates(false);
          setEntries(filteredEntries);
        } else {
          setShowDisplay(false);
          setShowNoDuplicates(true);
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
        setLoading(false);
      }
    };

    if (isLoading) {
      fetchEntries();
    }
  }, [isLoading, sdk.contentType.displayField, sdk.entry.fields, sdk.cma.entry, sdk.ids.entry, sdk.contentType.sys.id ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - date.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (dayDiff === 0) {
      return 'Today';
    } else if (dayDiff === 1) {
      return 'Yesterday';
    } else {
      return `${dayDiff} days ago`;
    }
  };

  return (
    <Stack alignItems="start" flexDirection="column" spacing="spacingS">
      <Button
        variant="primary"
        isLoading={isLoading}
        onClick={() => setLoading(true)}
      >
        Check Duplicates
      </Button>

      <Note variant='warning' style={{ display: showDisplay ? 'block' : 'none' }}>
        Duplicates identified:
        <ul>
          {entries.map(item => (
            <li key={item.sys.id}>
              <TextLink onClick={() => sdk.navigator.openEntry(item.sys.id)}>
                {item.fields[entryTitle][sdk.locales.default]} - updated {formatDate(item.sys.updatedAt)}
              </TextLink>
            </li>
          ))}
        </ul>
      </Note>

      <Note variant='positive' style={{ display: showNoDuplicates ? 'block' : 'none' }}>
        No duplicates identified.
      </Note>
    </Stack>
  );
};

export default Sidebar;

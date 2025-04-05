import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Button } from 'react-bootstrap';

function HomePageManager() {
  const { t, i18n } = useTranslation();
  const [homeContent, setHomeContent] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const currentLanguage = i18n.language;
  const translationFile = `public/i18n/lang/${currentLanguage}.json`;
  const [introStyles, setIntroStyles] = useState({});
  const [venueStyles, setVenueStyles] = useState({});

  useEffect(() => {
   const fetchHomeContent = async () => {
      setIsLoading(true);
      try {
        // Read the translation file
        const { content } = await read_file({ path: translationFile });
        const translations = JSON.parse(content);

        // Extract the home page content
        const homePageTranslations = {
          'home.welcome': translations['home.welcome'],
          'home.welcomeText': translations['home.welcomeText'],
          'home.coupleNames': translations['home.coupleNames'],
          'home.weddingDate': translations['home.weddingDate'],
          'home.theVenue': translations['home.theVenue'],
          'home.theDay': translations['home.theDay'],
          'home.aboutUs': translations['home.aboutUs'],
        };

        setHomeContent(homePageTranslations);
      } catch (error) {
        console.error("Failed to fetch home content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchIntroStyles = async () => {
      try {
        // Read the CSS file
        const cssFile = await read_file({ path: 'src/index.css' });
        // Extract the intro styles
        const introRegex = /#intro\s*\{([^}]*)\}/g;
        const introMatch = introRegex.exec(cssFile);
        if (introMatch) {
          const styles = introMatch[1].split(';').reduce((acc, style) => {
            const [key, value] = style.split(':').map(s => s.trim());
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          }, {});
          setIntroStyles(styles);
        }
      } catch (error) {
        console.error("Failed to fetch intro styles:", error);
      }
    };

     const fetchVenueStyles = async () => {
      try {
        // Read the CSS file
        const cssFile = await read_file({ path: 'public/css/style.css' });
        // Extract the venue styles
        const venueRegex = /\.timeline__cover\s*\{([^}]*)\}/g;
        const venueMatch = venueRegex.exec(cssFile);
        if (venueMatch) {
          const styles = venueMatch[1].split(';').reduce((acc, style) => {
            const [key, value] = style.split(':').map(s => s.trim());
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          }, {});
          setVenueStyles(styles);
        }
      } catch (error) {
        console.error("Failed to fetch venue styles:", error);
      }
    };

    fetchHomeContent();
    fetchIntroStyles();
    fetchVenueStyles();
  }, [currentLanguage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHomeContent(prevContent => ({
      ...prevContent,
      [name]: value
    }));
  };

  const handleCSSChange = (e) => {
    const { name, value } = e.target;
    setIntroStyles(prevStyles => ({
      ...prevStyles,
      [name]: value
    }));
  };

   const handleVenueCSSChange = (e) => {
    const { name, value } = e.target;
    setVenueStyles(prevStyles => ({
      ...prevStyles,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
         const fileContent = await (async () => {
          const result = await <read_file>
  <path>{translationFile}</path>
</read_file>;
          return result.content;
        })();
        const translations = JSON.parse(fileContent);

      // Update the translations with the new home content
      Object.keys(homeContent).forEach(key => {
        translations[key] = homeContent[key];
      });

      // Write the updated translations back to the file
      await write_to_file({ path: translationFile, content: JSON.stringify(translations, null, 2) });

      alert('Home page content updated successfully!');
    } catch (error) {
      console.error("Failed to update home content:", error);
      alert('Failed to update home page content.');
    }
  };

  const handleCSSSubmit = async (e) => {
    e.preventDefault();
    try {
      // Read the CSS file
      const cssFile = await read_file({ path: 'src/index.css' });

      // Update the intro styles
      let newCssFile = cssFile.replace(/#intro\s*\{([^}]*)\}/g, () => {
        let newStyles = '';
        Object.keys(introStyles).forEach(key => {
          newStyles += `${key}: ${introStyles[key]};`;
        });
        return `#intro {${newStyles}}`;
      });

      // Write the updated CSS back to the file
      await write_to_file({ path: 'src/index.css', content: newCssFile });

      alert('Intro section styles updated successfully!');
    } catch (error) {
      console.error("Failed to update intro section styles:", error);
      alert('Failed to update intro section styles.');
    }
  };

   const handleVenueCSSSubmit = async (e) => {
    e.preventDefault();
    try {
      // Read the CSS file
      const cssFile = await read_file({ path: 'public/css/style.css' });

      // Update the intro styles
      let newCssFile = cssFile.replace(/\.timeline__cover\s*\{([^}]*)\}/g, () => {
        let newStyles = '';
        Object.keys(venueStyles).forEach(key => {
          newStyles += `${key}: ${venueStyles[key]};`;
        });
        return `.timeline__cover {${newStyles}}`;
      });

      // Write the updated CSS back to the file
      await write_to_file({ path: 'public/css/style.css', content: newCssFile });

      alert('Venue section styles updated successfully!');
    } catch (error) {
      console.error("Failed to update Venue section styles:", error);
      alert('Failed to update Venue section styles.');
    }
  };

  if (isLoading) {
    return <p>Loading home page content...</p>;
  }

  return (
    <div className="container">
      <h2>Edit Home Page Content</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Welcome Title</Form.Label>
          <Form.Control
            type="text"
            name="home.welcome"
            value={homeContent["home.welcome"] || ""}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Welcome Text</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="home.welcomeText"
            value={homeContent["home.welcomeText"] || ""}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Couple Names</Form.Label>
          <Form.Control
            type="text"
            name="home.coupleNames"
            value={homeContent["home.coupleNames"] || ""}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Wedding Date</Form.Label>
          <Form.Control
            type="text"
            name="home.weddingDate"
            value={homeContent["home.weddingDate"] || ""}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>The Venue Title</Form.Label>
          <Form.Control
            type="text"
            name="home.theVenue"
            value={homeContent["home.theVenue"] || ""}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>The Day Title</Form.Label>
          <Form.Control
            type="text"
            name="home.theDay"
            value={homeContent["home.theDay"] || ""}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>About Us Title</Form.Label>
          <Form.Control
            type="text"
            name="home.aboutUs"
            value={homeContent["home.aboutUs"] || ""}
            onChange={handleChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
      </Form>

      <h3>Intro Section Styles</h3>
      <Form onSubmit={handleCSSSubmit}>
        <Form.Group>
          <Form.Label>Background Color</Form.Label>
          <Form.Control
            type="color"
            name="backgroundColor"
            value={introStyles.backgroundColor || '#242424'}
            onChange={handleCSSChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Text Color</Form.Label>
          <Form.Control
            type="color"
            name="color"
            value={introStyles.color || 'rgba(255, 255, 255, 0.87)'}
            onChange={handleCSSChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Save CSS Changes
        </Button>
      </Form>

      <h3>The Venue & The Day & About Us Section Styles</h3>
      <Form onSubmit={handleVenueCSSSubmit}>
        <Form.Group>
          <Form.Label>Background Image URL</Form.Label>
          <Form.Control
            type="text"
            name="backgroundImage"
            value={venueStyles.backgroundImage || 'url("https://via.placeholder.com/300x200")'}
            onChange={handleVenueCSSChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Padding</Form.Label>
          <Form.Control
            type="text"
            name="padding"
            value={venueStyles.padding || '50px 0'}
            onChange={handleVenueCSSChange}
          />
        </Form.Group>
         <Button variant="primary" type="submit">
          Save Venue CSS Changes
        </Button>
      </Form>
    </div>
  );
}

export default HomePageManager;

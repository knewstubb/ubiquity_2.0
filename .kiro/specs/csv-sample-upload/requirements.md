# Requirements Document

## Introduction

This feature makes the CSV sample file upload on the importer wizard's File Settings step (step 1) functional. When a user uploads a CSV file, the system parses the header row to extract column names and the first data row to extract example values. These extracted headers replace the hardcoded source fields in the mapping step, and the example values are displayed alongside each mapping row. All parsing happens client-side in the browser — no server-side processing is required.

## Glossary

- **Wizard**: The multi-step ImporterWizardModal used to create importer automations
- **File_Settings_Step**: Step 1 of the Wizard where file path, sample file, and data type are configured
- **Mapping_Step**: The ImportMappingStep component where source fields are mapped to target UbiQuity fields
- **CSV_Parser**: A client-side module that reads a CSV file and extracts the header row and first data row
- **Source_Fields**: Column headers extracted from the uploaded CSV file, displayed in the left column of the Mapping_Step
- **Target_Fields**: UbiQuity database fields displayed in the dropdown column of the Mapping_Step (determined by the selected data type)
- **Example_Values**: Values from the first data row of the CSV, displayed alongside each Source_Field in the Mapping_Step
- **Dropzone**: The file upload area on the File_Settings_Step where users drag-and-drop or browse for a CSV file
- **ImporterConfig**: The top-level configuration model that accumulates state across all wizard steps

## Requirements

### Requirement 1: CSV File Upload via Dropzone

**User Story:** As an importer creator, I want to upload a CSV sample file on the File Settings step, so that the system can learn the structure of my data files.

#### Acceptance Criteria

1. WHEN a user drops a CSV file onto the Dropzone, THE CSV_Parser SHALL read the file contents using the browser FileReader API
2. WHEN a user clicks "browse" in the Dropzone, THE File_Settings_Step SHALL open a native file picker filtered to files with the .csv extension
3. WHEN a file is selected via the file picker, THE CSV_Parser SHALL read the file contents using the browser FileReader API
4. WHEN a file has been accepted by the Dropzone, THE Dropzone SHALL display the file name both during and after parsing to indicate the file is loaded
5. IF a file without a .csv extension is uploaded, THEN THE File_Settings_Step SHALL display a validation error indicating the file type is not accepted and SHALL NOT pass the file to the CSV_Parser
6. IF the uploaded file contains no header row (empty file or file with zero bytes), THEN THE File_Settings_Step SHALL display a validation error indicating the file has no columns
7. IF the uploaded CSV file exceeds 5 MB in size, THEN THE File_Settings_Step SHALL display a validation error indicating the file is too large and SHALL NOT pass the file to the CSV_Parser

### Requirement 2: CSV Header Extraction

**User Story:** As an importer creator, I want the system to extract column headers from my CSV file, so that I can map them to UbiQuity fields.

#### Acceptance Criteria

1. WHEN a valid CSV file is parsed, THE CSV_Parser SHALL extract the first row as column header names and return them as an ordered array
2. WHEN a valid CSV file has more than one row, THE CSV_Parser SHALL extract the second row as example values and return them as a record keyed by the corresponding header name
3. THE CSV_Parser SHALL handle quoted fields containing commas, newlines, and escaped quotes per RFC 4180
4. THE CSV_Parser SHALL trim leading and trailing whitespace from each header name, and IF a header name is empty or contains only whitespace after trimming, THEN THE CSV_Parser SHALL assign a positional placeholder name in the format "Column N" where N is the 1-based column index
5. IF the CSV file contains only a header row with no data rows, THEN THE CSV_Parser SHALL return empty strings for all example values
6. THE CSV_Parser SHALL produce equivalent header names when parsing a header row, formatting it back to CSV via the format function, and parsing the result again (round-trip property)
7. IF the CSV file contains duplicate header names after trimming, THEN THE CSV_Parser SHALL append a numeric suffix to each duplicate (e.g. "Name", "Name_2", "Name_3") to ensure all returned header names are unique

### Requirement 3: Storing Parsed CSV Data in ImporterConfig

**User Story:** As an importer creator, I want my uploaded CSV data to persist across wizard steps, so that the mapping step can use the extracted headers.

#### Acceptance Criteria

1. WHEN the CSV_Parser successfully extracts headers, THE File_Settings_Step SHALL call onUpdate with a partial ImporterConfig patch containing the parsed column headers array and the column-to-example-value record
2. THE ImporterConfig SHALL include a field for storing the array of parsed CSV column headers, supporting a maximum of 1000 header entries where each header is a non-empty string of at most 255 characters
3. THE ImporterConfig SHALL include a field for storing the record of column-to-example-value mappings, where each key corresponds to a header name and each value is a string of at most 1000 characters (empty string if no data row exists)
4. WHEN a new CSV file is uploaded replacing a previous one, THE File_Settings_Step SHALL overwrite the previously stored headers and example values with those from the new file
5. IF the CSV_Parser returns an empty headers array (zero columns extracted), THEN THE File_Settings_Step SHALL NOT call onUpdate and SHALL leave the previously stored headers and example values unchanged
6. FOR ALL valid ImporterConfig objects containing CSV data, serializing then deserializing SHALL produce a deeply equal object (all fields, nested arrays, and record entries identical in value and order)

### Requirement 4: Mapping Step Uses Extracted Source Fields

**User Story:** As an importer creator, I want the mapping step to show my CSV column headers as the source fields, so that I can map my actual data structure to UbiQuity fields.

#### Acceptance Criteria

1. WHEN the Mapping_Step renders and ImporterConfig contains parsed CSV headers, THE Mapping_Step SHALL display those headers as the Source_Fields column in the same order they appear in the CSV header row, with exactly one row per header
2. WHEN the Mapping_Step renders and ImporterConfig contains parsed CSV headers, THE Mapping_Step SHALL display the corresponding example value from the first data row beside each Source_Field, or a dash character when the example value is empty
3. WHEN the Mapping_Step renders and ImporterConfig contains no parsed CSV headers, THE Mapping_Step SHALL display a message indicating that a sample file is required instead of the mapping table
4. WHILE a data type (contact or transactional) is selected, THE Mapping_Step SHALL populate the Target_Fields dropdown options with the fields defined for that data type
5. WHEN a new CSV file is uploaded replacing a previously parsed file, THE Mapping_Step SHALL clear all previously configured target field selections and display the new source fields with no pre-selected mappings

### Requirement 5: Lookup Field Mapping for Transactional Imports

**User Story:** As an importer creator, I want to specify which fields link my transactional records to contacts, so that the system knows which contact each transaction belongs to.

#### Acceptance Criteria

1. WHEN the Mapping_Step renders for a transactional data type, THE Mapping_Step SHALL display a "Lookup Field Mapping" section above the main transactional mapping table
2. THE Lookup Field Mapping section SHALL contain a row with a "File Column" dropdown (populated from the uploaded CSV headers) and a "Contact Table Column" dropdown (populated from the contact database fields)
3. WHEN the user selects a File Column and a Contact Table Column, THE Mapping_Step SHALL store the lookup mapping pair in ImporterConfig
4. THE Lookup Field Mapping section SHALL include an "+ Add Lookup Field" action that adds an additional lookup mapping row
5. WHEN multiple lookup rows are configured, THE Mapping_Step SHALL store all lookup pairs as an ordered array in ImporterConfig
6. WHEN no CSV file has been uploaded, THE File Column dropdown SHALL be empty and disabled
7. THE ImporterConfig SHALL include a field for storing the array of lookup field mappings, where each entry contains a sourceField (CSV column) and a contactField (contact table column)

### Requirement 6: File Replacement

**User Story:** As an importer creator, I want to replace a previously uploaded CSV file with a new one, so that I can correct mistakes without restarting the wizard.

#### Acceptance Criteria

1. WHEN a CSV file has already been uploaded, THE Dropzone SHALL display the current file name (truncated to 40 characters with ellipsis if longer) and a remove button that returns the Dropzone to its empty upload state
2. WHEN the user uploads a new file that passes validation, THE File_Settings_Step SHALL replace the previous file's parsed headers and example values with the new file's parsed headers and example values in ImporterConfig
3. IF the user uploads a replacement file that fails validation (non-CSV or empty header row), THEN THE File_Settings_Step SHALL display a validation error and retain the previously stored headers and example values unchanged
4. WHEN the user removes the uploaded file, THE File_Settings_Step SHALL clear the stored headers and example values from ImporterConfig and return the Dropzone to its empty upload state

### Requirement 7: CSV Pretty Printer

**User Story:** As a developer, I want a CSV formatter that can produce valid CSV from parsed data, so that round-trip correctness can be verified.

#### Acceptance Criteria

1. THE CSV_Parser module SHALL export a format function that takes an array of headers (1–1000 items, each 1–255 characters) and a record of example values and produces a CSV string conforming to RFC 4180 with the header row on line 1 and the data row on line 2, separated by CRLF line endings
2. IF a field value contains commas, newlines, or double quotes, THEN THE format function SHALL enclose the field in double quotes and escape any embedded double quotes by doubling them
3. IF the example values record does not contain a key for a given header, THEN THE format function SHALL output an empty (zero-length) field for that column
4. IF the headers array is empty, THEN THE format function SHALL return an empty string
5. FOR ALL valid arrays of header names, formatting then parsing SHALL produce header names that are character-for-character identical to the input after leading and trailing whitespace trimming (round-trip property)

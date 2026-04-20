import glob

files = glob.glob('src/**/*.tsx', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        text = file.read()
    
    # In Windows when write_to_file was used, \\${ might be present
    text = text.replace(r'\${', '${')
    text = text.replace(r'\`', '`')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(text)

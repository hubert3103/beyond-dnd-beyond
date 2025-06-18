
export const translations = {
  en: {
    // Navigation and UI
    'account_menu': 'Account Menu',
    'signed_in_as': 'Signed in as:',
    'switch_to_dm': 'Switch to DM',
    'switch_to_player': 'Switch to Player',
    'change_language': 'Change Language',
    'logout': 'Logout',
    'cancel': 'Cancel',
    
    // Character Sheet
    'my_characters': 'My characters',
    'character_not_found': 'Character not found',
    'loading_character': 'Loading character...',
    'go_back': 'Go Back',
    'edit_character': 'Edit Character',
    'export_pdf': 'Export PDF',
    'delete_character': 'Delete Character',
    
    // Common actions
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'close': 'Close',
    'confirm': 'Confirm',
    
    // Errors and messages
    'error': 'Error',
    'failed_to_load': 'Failed to load character',
    'failed_to_save': 'Failed to save character changes. Please try again.',
    
    // Tabs
    'characters': 'Characters',
    'spells': 'Spells',
    'items': 'Items',
    'manuals': 'Manuals'
  },
  nl: {
    // Navigation and UI
    'account_menu': 'Accountmenu',
    'signed_in_as': 'Ingelogd als:',
    'switch_to_dm': 'Wissel naar DM',
    'switch_to_player': 'Wissel naar Speler',
    'change_language': 'Taal wijzigen',
    'logout': 'Uitloggen',
    'cancel': 'Annuleren',
    
    // Character Sheet
    'my_characters': 'Mijn personages',
    'character_not_found': 'Personage niet gevonden',
    'loading_character': 'Personage laden...',
    'go_back': 'Ga terug',
    'edit_character': 'Personage bewerken',
    'export_pdf': 'Exporteer PDF',
    'delete_character': 'Personage verwijderen',
    
    // Common actions
    'save': 'Opslaan',
    'delete': 'Verwijderen',
    'edit': 'Bewerken',
    'close': 'Sluiten',
    'confirm': 'Bevestigen',
    
    // Errors and messages
    'error': 'Fout',
    'failed_to_load': 'Kon personage niet laden',
    'failed_to_save': 'Kon wijzigingen niet opslaan. Probeer opnieuw.',
    
    // Tabs
    'characters': 'Personages',
    'spells': 'Spreuken',
    'items': 'Voorwerpen',
    'manuals': 'Handboeken'
  },
  pl: {
    // Navigation and UI
    'account_menu': 'Menu konta',
    'signed_in_as': 'Zalogowany jako:',
    'switch_to_dm': 'Przełącz na MG',
    'switch_to_player': 'Przełącz na Gracza',
    'change_language': 'Zmień język',
    'logout': 'Wyloguj',
    'cancel': 'Anuluj',
    
    // Character Sheet
    'my_characters': 'Moje postacie',
    'character_not_found': 'Nie znaleziono postaci',
    'loading_character': 'Ładowanie postaci...',
    'go_back': 'Wróć',
    'edit_character': 'Edytuj postać',
    'export_pdf': 'Eksportuj PDF',
    'delete_character': 'Usuń postać',
    
    // Common actions
    'save': 'Zapisz',
    'delete': 'Usuń',
    'edit': 'Edytuj',
    'close': 'Zamknij',
    'confirm': 'Potwierdź',
    
    // Errors and messages
    'error': 'Błąd',
    'failed_to_load': 'Nie udało się załadować postaci',
    'failed_to_save': 'Nie udało się zapisać zmian. Spróbuj ponownie.',
    
    // Tabs
    'characters': 'Postacie',
    'spells': 'Zaklęcia',
    'items': 'Przedmioty',
    'manuals': 'Podręczniki'
  }
};

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;

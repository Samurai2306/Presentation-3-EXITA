/** Единый словарь интерфейса (демо). */
export const LABELS = {
  appName: 'Я живой',
  rolePatient: 'Пациент',
  roleCaregiver: 'Опекун / координатор',
  patientHomeTab: 'Мой день',
  hubTab: 'Обзор',
  surveyTab: 'Опрос',
  careTab: 'Забота',
  trustTab: 'Контакты',
  consoleTab: 'Консоль',
  monitoringTab: 'Наблюдение',
  planningTab: 'План',
  moreTab: 'Ещё',
  demoBanner:
    'Демо без сервера: роли и данные не защищены как в проде. В реальном приложении будет вход и права доступа.',
  caregiverPinHint: 'Демо-PIN для режима опекуна: 1234 (можно сменить в коде).',
} as const

export const DEMO_CAREGIVER_PIN = '1234'

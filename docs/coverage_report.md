# Coverage Report

## Загальне покриття
- Statements/Instructions: 67%
- Branches: 46%
- Functions/Methods: 76%
- Lines: 67%

## Аналіз
- Які функції/класи покриті найкраще?

Найсильніше покриття у CRUD/сервісній та репозиторній частині:

Пакети з топ-покриттям:
- com.softserve.repository — 100% instructions, 88% branches
- com.softserve.entity.enums, com.softserve.dto.enums — 100%
- com.softserve.service.impl — 78% (високо для великого пакета)
Класи з 100% (або близько):
- GroupServiceImpl, SubjectServiceImpl, RoomTypeServiceImpl, DepartmentServiceImpl — 100%
У контролерах: GroupController, StudentController, SubjectController, PeriodController, DepartmentController, RoomTypeController — 100%
- PasswordGeneratingUtil — 100%
Добре покриті, але не ідеально: StudentServiceImpl (95%), PeriodServiceImpl (95%), ConverterToSchedulesInRoom (98%)
##
- Які потребують додаткових тестів?
Пріоритетно ті, де 0–20%:

- com.softserve.util (31% / branches 12%)
  - GroupHtmlBuilder — 0%
  - NullAwareBeanUtils — 0%
  - SchedulePdfStyles — ~10%
- com.softserve.security.jwt (30% / branches 33%)
  - JwtUser, JwtUserFactory, JwtConfigurer — 0%
  - JwtTokenProvider — 22%
- com.softserve.controller
  - AdminCacheController — 0%
  - AuthenticationController — ~10%
  - DownloadFileController — ~3%
- com.softserve.service.impl
  - SchedulePublishServiceImpl — ~3%
  - ScheduleCacheService — ~8%
  - MailServiceImpl — ~19%
- com.softserve.mapper
  - ScheduleMapperImpl — ~1%
  - LessonsInScheduleMapperImpl — ~19%
  - ScheduleSaveMapperImpl — ~34%
  - TeacherNameMapperImpl — ~33%
##
- Чому деякі branches не покриті?
  - Не протестовані альтернативні гілки:
    наприклад JWT-логіка (validateToken, shouldRefresh, invalid/expired token), cache/admin сценарії, auth flow.
  - Не покриті null/empty/optional кейси в мапперах:
    - у MapperImpl багато пропущених гілок типу “null vs non-null”, “порожня колекція vs непорожня”.
  - Частина класів має n/a по branches (немає умовних операторів) — це нормально і не є проблемою.
  - У кількох mapper-класах видно Source file ... was not found; Ці гілки теж потрібно покривати через тести сервісів/мапінгу.

## Скріншот
<img width="2198" height="1023" alt="image" src="https://github.com/user-attachments/assets/38fc1f5e-6c1e-4cbf-bf29-4e85c87e0c54" />

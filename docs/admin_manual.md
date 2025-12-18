# Admin Manual (MVP)

## Login

- Open `/login` and sign in with an admin account.
- Admin role is stored in `public.profiles.role`.

## Manage tests

- Go to `/admin/tests`.
- Create a test (title, time limit, max attempts).
- Click a test to open `/admin/tests/{testId}`.

## Add questions and answers

- On the test detail page:
  - Add questions.
  - Add options under each question.
  - Click **Mark correct** on the correct option.

## Publish

- In **Settings**, toggle **Published** and save.
- Only published tests appear to students.

## View results

- Go to `/admin/results` to see recent attempts.

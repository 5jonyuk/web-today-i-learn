# DB 공통교육 실습

## 문제 1: 테이블 생성하기 (CREATE TABLE)

1. attendance 테이블은 중복된 데이터가 쌓이는 구조이다. 중복된 데이터는 어떤 컬럼인가?
   - nickname

2. attendance 테이블에서 중복을 제거하기 위해 crew 테이블을 만들려고 한다. 어떻게 구성해 볼 수 있을까?
   - id, nickname

3. crew 테이블에 들어가야 할 크루들의 정보는 어떻게 추출할까? (hint: DISTINCT)

   ```sql
   SELECT DISTINCT id, nickname
   FROM attendance
   ORDER BY id
   ```

4. 최종적으로 crew 테이블 생성:

   ```sql
   CREATE TABLE crew (
     id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
     nickname VARCHAR(50) NOT NULL
     )
   ```

5. attendance 테이블에서 크루 정보를 추출해서 crew 테이블에 삽입하기

   ```sql
   INSERT INTO crew (nickname)
   SELECT DISTINCT nickname
   FROM attendance
   ```

## 문제 2: 테이블 컬럼 삭제하기 (ALTER TABLE) crew 테이블을 만들고 중복을 제거했다.

1. attendance에서 불필요해지는 컬럼은?
   - nickname

2. 컬럼을 삭제하려면 어떻게 해야 하는가?

   ```sql
   ALTER TABLE attendance
   DROP COLUMN nickname
   ```

## 문제 3: 외래키 설정하기

1. 만약에 crew 테이블에는 crew_id가 12번인 크루가 존재하지 않지만, attendance 테이블에는 여전히 crew_id가 12번인 크루가 존재한다면?

   ```sql
   ALTER TABLE attendance
   ADD CONSTRAINT fk_attendance_crew
   FOREIGN KEY (crew_id)
   REFERENCES crew(id);
   ```

## 문제 4: 유니크 키 설정

```sql
ALTER TABLE crew
ADD CONSTRAINT uk_crew_nickname
UNIQUE (nickname)
```

## 문제 5: 크루 닉네임 검색하기 (LIKE)

```sql
SELECT nickname FROM crew WHERE nickname LIKE '디%';
```

## 문제 6: 출석 기록 확인하기 (SELECT + WHERE)

```sql
SELECT *
FROM attendance
WHERE
   crew_id = (SELECT id FROM crew where nickname = '어셔')
   AND attendance_date = '2026-03-06'
```

## 문제 7: 누락된 출석 기록 추가 (INSERT)

```sql
INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (
   (SELECT id FROM crew WHERE nickname = '어셔'),
   '2026-03-06',
   '09:31',
   '18:01'
)
```

## 문제 8: 잘못된 출석 기록 수정 (UPDATE)

```sql
UPDATE attendance a
SET start_time = '10:00:00'
FROM crew c
WHERE a.crew_id = c.id AND
c.nickname = '주니' AND
a.attendance_date = '2026-03-12'
```

## 문제 9: 허위 출석 기록 삭제 (DELETE)

```sql
DELETE FROM attendance
WHERE
   crew_id = (SELECT id FROM crew WHERE nickname = '아론') AND attendance_date = '2026-03-12'
```

## 문제 10: 출석 정보 조회하기 (JOIN)

```sql
SELECT *
FROM attendance a
JOIN crew c ON a.crew_id = c.id
WHERE nickname = '검프'
```

## 문제 11: nickname으로 쿼리 처리하기 (서브 쿼리)

```sql
SELECT *
FROM attendance
WHERE crew_id = (SELECT id FROM crew where nickname = '검프')
```

## 문제 12: 가장 늦게 하교한 크루 찾기

```sql
SELECT c.nickname, a.end_time
FROM attendance a
JOIN crew c ON a.crew_id = c.id
WHERE a.attendance_date = '2026-03-05'
ORDER BY a.end_time DESC
LIMIT 1;
```

## 문제 13: 크루별로 '기록된' 날짜 수 조회

```sql
SELECT a.crew_id, count(*)
FROM attendance a
GROUP BY a.crew_id
```

## 문제 14: 크루별로 등교 기록이 있는(start_time IS NOT NULL) 날짜 수 조회

```sql
SELECT crew_id, count(*)
FROM attendance a
WHERE a.start_time IS NOT NULL
GROUP BY a.crew_id
```

## 문제 15: 날짜별로 등교한 크루 수 조회

```sql
SELECT a.attendance_date, count(a.crew_id)
FROM attendance a
WHERE a.start_time IS NOT NULL
GROUP BY a.attendance_date
```

## 문제 16: 크루별 가장 빠른 등교 시각(MIN)과 가장 늦은 등교 시각(MAX)

```sql
SELECT a.crew_id, MIN(start_time), max(end_time)
FROM attendance a
GROUP BY a.crew_id
```

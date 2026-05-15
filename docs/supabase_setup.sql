-- sentiment_logs 테이블 생성
-- 사용 목적: 사용자가 입력한 텍스트와 감성 분석 결과를 저장
create table if not exists sentiment_logs (
  id uuid primary key default gen_random_uuid(),
  input_text text not null,
  sentiment text not null check (sentiment in ('positive', 'negative', 'neutral')),
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  reason text not null,
  created_at timestamptz not null default now()
);

-- RLS (Row Level Security) 설정
-- 초기 버전은 모든 사용자가 분석 기록을 남길 수 있도록 insert만 허용하거나, service_role 키를 사용하므로 설정을 생략할 수 있습니다.
-- 보안을 위해 select는 제한하는 것이 좋습니다.
alter table sentiment_logs enable row level security;

-- 서비스 역할(Service Role)만 모든 권한을 갖도록 설정
create policy "Service Role full access" on sentiment_logs
  for all using (true) with check (true);

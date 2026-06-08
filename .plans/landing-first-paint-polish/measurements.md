# 랜딩 첫 화면 이미지 개선 측정

측정일: 2026-06-08

## 자산 크기

명령:

```bash
wc -c public/images/hero-image.png public/images/hero-image-landing.webp
du -h public/images/hero-image.png public/images/hero-image-landing.webp
```

결과:

| 항목 | 파일 | 크기 |
|---|---|---:|
| 변경 전 원본 | `public/images/hero-image.png` | 44,129,015 bytes (`43M`) |
| 변경 후 랜딩 자산 | `public/images/hero-image-landing.webp` | 329,220 bytes (`324K`) |

감소:

- 43,799,795 bytes 감소
- 약 99.25% 감소

## Next Image Optimizer 비교

production 서버(`npm start`)에서 같은 width 조건(`w=1920&q=75`)으로 비교했다.

명령:

```bash
curl -s -o /tmp/old-hero-1920.webp -w 'old_optimizer_time=%{time_total}\nold_download_bytes=%{size_download}\n' 'http://127.0.0.1:3000/_next/image?url=%2Fimages%2Fhero-image.png&w=1920&q=75'
curl -s -o /tmp/new-hero-1920.webp -w 'new_optimizer_time=%{time_total}\nnew_download_bytes=%{size_download}\n' 'http://127.0.0.1:3000/_next/image?url=%2Fimages%2Fhero-image-landing.webp&w=1920&q=75'
```

결과:

| 항목 | 시간 | 다운로드 |
|---|---:|---:|
| 변경 전 원본 PNG 기반 optimizer | 3.299s | 766,961 bytes |
| 변경 후 WebP 기반 optimizer | 0.389s | 218,602 bytes |

감소:

- optimizer 응답 시간 약 88.21% 감소
- optimizer 다운로드 크기 약 71.50% 감소

## 실제 랜딩 브라우저 측정

production 서버(`npm start`) + Playwright Chromium, viewport `1440x900`에서 `/` 진입 후 `performance.getEntriesByType("resource")`를 확인했다.

결과:

- 히어로 이미지 요청: `/_next/image?url=%2Fimages%2Fhero-image-landing.webp&w=1920&q=75`
- duration: `713ms`
- encodedBodySize: `185,722 bytes`
- transferSize: `186,022 bytes`
- 스크롤 버튼 위치: top `836`, bottom `868`
- viewport height: `900`

판정:

- 히어로 이미지 요청은 신규 경량 자산을 사용한다.
- 스크롤 버튼은 첫 viewport 안에 있다.

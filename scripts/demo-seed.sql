-- DEMO SEED — mirror data demo dari local (TANPA venue/secret). Idempotent.
-- Loader: scripts/demo-seed.mjs (jalan hanya kalau env DEMO_SEED truthy).
BEGIN;
SET session_replication_role = replica;  -- bypass FK saat load
-- Nyalakan modul POS + Liga di venue prod (jangan sentuh kolom kredensial).
UPDATE onepadel.venue SET pos_enabled = true, liga_enabled = true;
TRUNCATE TABLE
  onepadel.court, onepadel.category, onepadel.product, onepadel.coach,
  onepadel.membership_plan, onepadel.open_play_session, onepadel.season,
  onepadel.league, onepadel.team, onepadel.player, onepadel.match,
  onepadel.game, onepadel.hall_of_fame
  RESTART IDENTITY CASCADE;
--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: category; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.category VALUES ('e0574327-7b35-48eb-a3c6-e1f6fbca822a', 'Upper Beginner Pria', 'PRIA', 'Upper Beginner', 'Rabu', 'Senin', 1);
INSERT INTO onepadel.category VALUES ('ac854666-4ca4-49fd-b8ea-3e8c27a21454', 'Upper Beginner Wanita', 'WANITA', 'Upper Beginner', 'Kamis', 'Selasa', 2);
INSERT INTO onepadel.category VALUES ('be0a989b-4a8b-415b-8e46-7bcb0040aee1', 'Bronze Pria', 'PRIA', 'Bronze', 'Rabu', 'Senin', 3);
INSERT INTO onepadel.category VALUES ('a631aa26-6d8a-48f6-9385-3274f712d581', 'Bronze Wanita', 'WANITA', 'Bronze', 'Kamis', 'Selasa', 4);


--
-- Data for Name: coach; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.coach VALUES ('2802ac60-c1c7-4d97-9511-186deaeebc6f', 'Coach Bagas', 'https://ui-avatars.com/api/?name=Coach%20Bagas&background=1a4d33&color=fff&size=256', 'Pelatih bersertifikat, fokus teknik dasar dan footwork untuk pemula hingga menengah.', 150000, true, 1, '2026-06-16 12:43:30.778315');
INSERT INTO onepadel.coach VALUES ('fd12a3ef-18d6-4d9d-a0e2-4015f050ce58', 'Coach Sinta', 'https://ui-avatars.com/api/?name=Coach%20Sinta&background=1a4d33&color=fff&size=256', 'Spesialis strategi bermain ganda dan positioning. Cocok untuk yang ingin naik level.', 175000, true, 2, '2026-06-16 12:43:30.778315');
INSERT INTO onepadel.coach VALUES ('c073856e-26f6-4898-8b04-4cdb406a2a96', 'Coach Rian', 'https://ui-avatars.com/api/?name=Coach%20Rian&background=1a4d33&color=fff&size=256', 'Mantan pemain kompetitif. Latihan intensif untuk smash, bandeja, dan vibora.', 200000, true, 3, '2026-06-16 12:43:30.778315');


--
-- Data for Name: court; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.court VALUES ('524fa746-de03-4198-8523-670d3981dbee', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'Court 1 Hijau', 'INDOOR', 175000, true, 1, '2026-06-16 11:15:58.776655', 'Premium Synthetic Grass');
INSERT INTO onepadel.court VALUES ('a316a59a-d3c6-43d9-8593-8b90c78ec2b1', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'Court 2 Teracotta', 'INDOOR', 175000, true, 2, '2026-06-16 11:15:58.776655', 'Premium Synthetic Grass');
INSERT INTO onepadel.court VALUES ('9563cd9b-8389-4510-8b54-0bf87beb11fa', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'Court 3 Hijau', 'INDOOR', 200000, true, 3, '2026-06-16 11:15:58.776655', 'Premium Synthetic Grass');
INSERT INTO onepadel.court VALUES ('9cda2168-70d1-4d40-a8a8-17cfe872ba67', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'Court 4 Teracotta', 'INDOOR', 275000, true, 4, '2026-06-16 11:15:58.776655', 'Premium Synthetic Grass');


--
-- Data for Name: season; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.season VALUES ('f43a8e2d-c524-44db-9eae-478afbd15f1b', 'Season I', 2025, 'ACTIVE', '2026-05-19', NULL, '2026-06-16 13:15:45.258001');


--
-- Data for Name: league; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.league VALUES ('801b419a-0245-48ad-bbf1-899b436d2895', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'e0574327-7b35-48eb-a3c6-e1f6fbca822a', 1);
INSERT INTO onepadel.league VALUES ('3affae1e-8b6c-4694-9676-da081c41309c', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'e0574327-7b35-48eb-a3c6-e1f6fbca822a', 2);
INSERT INTO onepadel.league VALUES ('744a91f4-89e3-4725-8c36-3e7eb06b3042', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'ac854666-4ca4-49fd-b8ea-3e8c27a21454', 1);
INSERT INTO onepadel.league VALUES ('16845ae0-ca8f-4fd8-a480-cd1677ba1cb4', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'ac854666-4ca4-49fd-b8ea-3e8c27a21454', 2);
INSERT INTO onepadel.league VALUES ('6fad954b-f34c-4a03-8688-23d5a1c8b494', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'be0a989b-4a8b-415b-8e46-7bcb0040aee1', 1);
INSERT INTO onepadel.league VALUES ('a1cc62c0-8b3d-42b1-b07b-e70c89cb8d24', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'be0a989b-4a8b-415b-8e46-7bcb0040aee1', 2);
INSERT INTO onepadel.league VALUES ('c71c668d-47fd-4c9f-9db0-ba429b417edc', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'a631aa26-6d8a-48f6-9385-3274f712d581', 1);
INSERT INTO onepadel.league VALUES ('93b1e755-a32b-4efc-bf85-ce4f25f4b7ab', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'a631aa26-6d8a-48f6-9385-3274f712d581', 2);


--
-- Data for Name: team; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.team VALUES ('58aaa69d-cb1c-4aab-a038-abec55089d6b', '801b419a-0245-48ad-bbf1-899b436d2895', 'Tim Alpha', NULL, '#1a4d33', 1);
INSERT INTO onepadel.team VALUES ('0cf7fdd3-d4b1-4000-8708-e87a5080597e', '801b419a-0245-48ad-bbf1-899b436d2895', 'Tim Bravo', NULL, '#d97721', 2);
INSERT INTO onepadel.team VALUES ('39d8d892-f5f2-4965-9aa2-efcbd161b74e', '801b419a-0245-48ad-bbf1-899b436d2895', 'Tim Charlie', NULL, '#2563eb', 3);
INSERT INTO onepadel.team VALUES ('799a2219-d101-4d2d-947e-2cc5927d31e1', '801b419a-0245-48ad-bbf1-899b436d2895', 'Tim Delta', NULL, '#9333ea', 4);
INSERT INTO onepadel.team VALUES ('5fff1a1e-2770-47f1-a148-6fa87763c807', '801b419a-0245-48ad-bbf1-899b436d2895', 'Tim Echo', NULL, '#dc2626', 5);
INSERT INTO onepadel.team VALUES ('e6732bef-7a55-4021-bbf2-a9d841079509', '801b419a-0245-48ad-bbf1-899b436d2895', 'Tim Foxtrot', NULL, '#0891b2', 6);
INSERT INTO onepadel.team VALUES ('36deeb11-c11a-42ef-8b1c-f08878248731', '801b419a-0245-48ad-bbf1-899b436d2895', 'Tim Golf', NULL, '#ca8a04', 7);
INSERT INTO onepadel.team VALUES ('752433b7-6cb8-4733-8234-a4c541581704', '801b419a-0245-48ad-bbf1-899b436d2895', 'Tim Hotel', NULL, '#475569', 8);
INSERT INTO onepadel.team VALUES ('8dbb2b66-9764-4329-8859-0f1fcb1ba59d', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'Tim Alpha', NULL, '#1a4d33', 1);
INSERT INTO onepadel.team VALUES ('3359e334-4e2b-4f1e-851f-8b1c060f3aac', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'Tim Bravo', NULL, '#d97721', 2);
INSERT INTO onepadel.team VALUES ('ec184197-ec18-44e4-b3a3-a27fa20ee1b3', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'Tim Charlie', NULL, '#2563eb', 3);
INSERT INTO onepadel.team VALUES ('877b9541-3f38-400c-b9ee-e1bfe123fdf7', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'Tim Delta', NULL, '#9333ea', 4);
INSERT INTO onepadel.team VALUES ('f5988285-fb61-432d-8ed9-31c3c5cb4496', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'Tim Echo', NULL, '#dc2626', 5);
INSERT INTO onepadel.team VALUES ('447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'Tim Foxtrot', NULL, '#0891b2', 6);
INSERT INTO onepadel.team VALUES ('a2890e63-6bfe-4c92-b45b-407033feb900', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'Tim Golf', NULL, '#ca8a04', 7);
INSERT INTO onepadel.team VALUES ('006c425f-d885-4818-a8cc-3949a1eaf318', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'Tim Hotel', NULL, '#475569', 8);
INSERT INTO onepadel.team VALUES ('97b3d6bf-8825-4cf5-bd8c-287705307a4b', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'Tim Alpha', NULL, '#1a4d33', 1);
INSERT INTO onepadel.team VALUES ('0c741125-5e59-4b0d-b26c-ab6059dc3ff3', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'Tim Bravo', NULL, '#d97721', 2);
INSERT INTO onepadel.team VALUES ('990aaaf7-bb2b-4e19-807a-e25e6ec14a98', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'Tim Charlie', NULL, '#2563eb', 3);
INSERT INTO onepadel.team VALUES ('d1466316-88c3-4217-9c96-bfd53567b819', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'Tim Delta', NULL, '#9333ea', 4);
INSERT INTO onepadel.team VALUES ('f167eb89-1174-4150-8b20-3a1b689c9900', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'Tim Echo', NULL, '#dc2626', 5);
INSERT INTO onepadel.team VALUES ('91b0824c-1385-4060-aba5-c1fbc3c225b6', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'Tim Foxtrot', NULL, '#0891b2', 6);
INSERT INTO onepadel.team VALUES ('443bce52-6fd6-4cb2-9987-6dad6317f27d', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'Tim Golf', NULL, '#ca8a04', 7);
INSERT INTO onepadel.team VALUES ('58a5c1e2-b251-49f5-9016-dc53c322c446', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'Tim Hotel', NULL, '#475569', 8);
INSERT INTO onepadel.team VALUES ('bcfc1607-ddc6-448c-9f4e-3578ef817318', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'Tim Alpha', NULL, '#1a4d33', 1);
INSERT INTO onepadel.team VALUES ('43a95adc-f0b1-44b6-a898-e35f8273b4cb', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'Tim Bravo', NULL, '#d97721', 2);
INSERT INTO onepadel.team VALUES ('179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'Tim Charlie', NULL, '#2563eb', 3);
INSERT INTO onepadel.team VALUES ('159caf31-9b0e-4300-bb9d-0f0f3fc51c06', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'Tim Delta', NULL, '#9333ea', 4);
INSERT INTO onepadel.team VALUES ('de7c10d2-defe-4ab2-a010-7edbea31a48f', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'Tim Echo', NULL, '#dc2626', 5);
INSERT INTO onepadel.team VALUES ('62036e57-ead3-4f17-a90d-7881597efddb', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'Tim Foxtrot', NULL, '#0891b2', 6);
INSERT INTO onepadel.team VALUES ('e3913e97-ad99-4ff6-bb07-349d0b1c6445', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'Tim Golf', NULL, '#ca8a04', 7);
INSERT INTO onepadel.team VALUES ('3609c983-e7f2-44df-a22d-26828bc0bb43', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'Tim Hotel', NULL, '#475569', 8);


--
-- Data for Name: match; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.match VALUES ('c97b744f-9d23-4bea-b0b0-2bf37d8ec239', '801b419a-0245-48ad-bbf1-899b436d2895', '0cf7fdd3-d4b1-4000-8708-e87a5080597e', '36deeb11-c11a-42ef-8b1c-f08878248731', 1, '2026-05-26', 19, 'Court 2', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.287647');
INSERT INTO onepadel.match VALUES ('a3c7c0b2-91d1-4552-97ed-2061a1db1924', '801b419a-0245-48ad-bbf1-899b436d2895', '39d8d892-f5f2-4965-9aa2-efcbd161b74e', 'e6732bef-7a55-4021-bbf2-a9d841079509', 1, '2026-05-26', 20, 'Court 3', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.292083');
INSERT INTO onepadel.match VALUES ('b76a20a8-3515-40a5-8338-7db6af0089be', '801b419a-0245-48ad-bbf1-899b436d2895', '799a2219-d101-4d2d-947e-2cc5927d31e1', '5fff1a1e-2770-47f1-a148-6fa87763c807', 1, '2026-05-26', 21, 'Court 4', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.295763');
INSERT INTO onepadel.match VALUES ('309668ae-bccc-48ff-9d05-c75eab572afd', '801b419a-0245-48ad-bbf1-899b436d2895', '58aaa69d-cb1c-4aab-a038-abec55089d6b', '36deeb11-c11a-42ef-8b1c-f08878248731', 2, '2026-06-02', 18, 'Court 1', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.297776');
INSERT INTO onepadel.match VALUES ('2a92ffa1-e917-4acf-958d-c6fcbd2b1a8d', '801b419a-0245-48ad-bbf1-899b436d2895', '752433b7-6cb8-4733-8234-a4c541581704', 'e6732bef-7a55-4021-bbf2-a9d841079509', 2, '2026-06-02', 19, 'Court 2', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.299665');
INSERT INTO onepadel.match VALUES ('094ecdbe-8d96-450f-9681-8c41f0aa938d', '801b419a-0245-48ad-bbf1-899b436d2895', '0cf7fdd3-d4b1-4000-8708-e87a5080597e', '5fff1a1e-2770-47f1-a148-6fa87763c807', 2, '2026-06-02', 20, 'Court 3', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.301515');
INSERT INTO onepadel.match VALUES ('495ba141-60e9-4aab-99a7-e678e44c3263', '801b419a-0245-48ad-bbf1-899b436d2895', '39d8d892-f5f2-4965-9aa2-efcbd161b74e', '799a2219-d101-4d2d-947e-2cc5927d31e1', 2, '2026-06-02', 21, 'Court 4', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.303389');
INSERT INTO onepadel.match VALUES ('41924142-a09d-4847-bed8-7cace0e47a65', '801b419a-0245-48ad-bbf1-899b436d2895', '58aaa69d-cb1c-4aab-a038-abec55089d6b', 'e6732bef-7a55-4021-bbf2-a9d841079509', 3, '2026-06-09', 18, 'Court 1', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.305062');
INSERT INTO onepadel.match VALUES ('7a74e47f-404f-44ef-b81f-c997f6f04344', '801b419a-0245-48ad-bbf1-899b436d2895', '36deeb11-c11a-42ef-8b1c-f08878248731', '5fff1a1e-2770-47f1-a148-6fa87763c807', 3, '2026-06-09', 19, 'Court 2', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.306898');
INSERT INTO onepadel.match VALUES ('e227f646-9f09-40ee-8053-1c59eaba7f66', '801b419a-0245-48ad-bbf1-899b436d2895', '752433b7-6cb8-4733-8234-a4c541581704', '799a2219-d101-4d2d-947e-2cc5927d31e1', 3, '2026-06-09', 20, 'Court 3', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.30877');
INSERT INTO onepadel.match VALUES ('1f0b09ef-f61c-4126-978b-7361b8842dcd', '801b419a-0245-48ad-bbf1-899b436d2895', '0cf7fdd3-d4b1-4000-8708-e87a5080597e', '39d8d892-f5f2-4965-9aa2-efcbd161b74e', 3, '2026-06-09', 21, 'Court 4', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.310601');
INSERT INTO onepadel.match VALUES ('beefabaa-b16e-43b5-a790-4bbe884cb0d2', '801b419a-0245-48ad-bbf1-899b436d2895', '58aaa69d-cb1c-4aab-a038-abec55089d6b', '5fff1a1e-2770-47f1-a148-6fa87763c807', 4, '2026-06-16', 18, 'Court 1', 'LIVE', 1, 0, NULL, '2026-06-16 13:15:45.31227');
INSERT INTO onepadel.match VALUES ('0ac1c3e3-4602-491d-b23b-f82749bc6702', '801b419a-0245-48ad-bbf1-899b436d2895', 'e6732bef-7a55-4021-bbf2-a9d841079509', '799a2219-d101-4d2d-947e-2cc5927d31e1', 4, '2026-06-16', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.314316');
INSERT INTO onepadel.match VALUES ('1ebabaf1-7298-42ce-a756-96caa08beb17', '801b419a-0245-48ad-bbf1-899b436d2895', '36deeb11-c11a-42ef-8b1c-f08878248731', '39d8d892-f5f2-4965-9aa2-efcbd161b74e', 4, '2026-06-16', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.314954');
INSERT INTO onepadel.match VALUES ('c60de5a1-2925-400f-9ca9-cf3419ab2d46', '801b419a-0245-48ad-bbf1-899b436d2895', '752433b7-6cb8-4733-8234-a4c541581704', '0cf7fdd3-d4b1-4000-8708-e87a5080597e', 4, '2026-06-16', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.315602');
INSERT INTO onepadel.match VALUES ('dbfc61db-731e-45c6-ac20-aa3cd621aa1f', '801b419a-0245-48ad-bbf1-899b436d2895', '58aaa69d-cb1c-4aab-a038-abec55089d6b', '799a2219-d101-4d2d-947e-2cc5927d31e1', 5, '2026-06-23', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.316251');
INSERT INTO onepadel.match VALUES ('0d9d61c2-c04c-4f53-91d0-8c7d989a87a7', '801b419a-0245-48ad-bbf1-899b436d2895', '5fff1a1e-2770-47f1-a148-6fa87763c807', '39d8d892-f5f2-4965-9aa2-efcbd161b74e', 5, '2026-06-23', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.316872');
INSERT INTO onepadel.match VALUES ('06cf9bd9-7b86-414b-aeda-550016a38940', '801b419a-0245-48ad-bbf1-899b436d2895', 'e6732bef-7a55-4021-bbf2-a9d841079509', '0cf7fdd3-d4b1-4000-8708-e87a5080597e', 5, '2026-06-23', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.317473');
INSERT INTO onepadel.match VALUES ('9e43322e-8907-4fdd-8126-b89bde84311f', '801b419a-0245-48ad-bbf1-899b436d2895', '36deeb11-c11a-42ef-8b1c-f08878248731', '752433b7-6cb8-4733-8234-a4c541581704', 5, '2026-06-23', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.318092');
INSERT INTO onepadel.match VALUES ('52f01f02-dcb3-462b-b6bb-a955070f8d86', '801b419a-0245-48ad-bbf1-899b436d2895', '58aaa69d-cb1c-4aab-a038-abec55089d6b', '39d8d892-f5f2-4965-9aa2-efcbd161b74e', 6, '2026-06-30', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.31874');
INSERT INTO onepadel.match VALUES ('0b895ce5-3e12-45a4-9291-692f41b8dd8a', '801b419a-0245-48ad-bbf1-899b436d2895', '58aaa69d-cb1c-4aab-a038-abec55089d6b', '752433b7-6cb8-4733-8234-a4c541581704', 1, '2026-05-26', 18, 'Court 1', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.280318');
INSERT INTO onepadel.match VALUES ('57097a9f-2641-4c45-8c0a-7418d41bc3c0', '801b419a-0245-48ad-bbf1-899b436d2895', '799a2219-d101-4d2d-947e-2cc5927d31e1', '0cf7fdd3-d4b1-4000-8708-e87a5080597e', 6, '2026-06-30', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.319377');
INSERT INTO onepadel.match VALUES ('d6744447-fd6a-4d26-affa-4633fd1fb11b', '801b419a-0245-48ad-bbf1-899b436d2895', '5fff1a1e-2770-47f1-a148-6fa87763c807', '752433b7-6cb8-4733-8234-a4c541581704', 6, '2026-06-30', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.320587');
INSERT INTO onepadel.match VALUES ('015f15d9-d66f-46ca-9da6-220f0e1b5716', '801b419a-0245-48ad-bbf1-899b436d2895', 'e6732bef-7a55-4021-bbf2-a9d841079509', '36deeb11-c11a-42ef-8b1c-f08878248731', 6, '2026-06-30', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.321219');
INSERT INTO onepadel.match VALUES ('eef91b44-5de6-44d9-bee7-7daddae35e6f', '801b419a-0245-48ad-bbf1-899b436d2895', '58aaa69d-cb1c-4aab-a038-abec55089d6b', '0cf7fdd3-d4b1-4000-8708-e87a5080597e', 7, '2026-07-07', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.321831');
INSERT INTO onepadel.match VALUES ('9b34c6c5-b56b-4442-8bcd-f60287e7cb7f', '801b419a-0245-48ad-bbf1-899b436d2895', '39d8d892-f5f2-4965-9aa2-efcbd161b74e', '752433b7-6cb8-4733-8234-a4c541581704', 7, '2026-07-07', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.322423');
INSERT INTO onepadel.match VALUES ('239e417b-f2c7-48f5-bda7-73df198f391d', '801b419a-0245-48ad-bbf1-899b436d2895', '799a2219-d101-4d2d-947e-2cc5927d31e1', '36deeb11-c11a-42ef-8b1c-f08878248731', 7, '2026-07-07', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.323033');
INSERT INTO onepadel.match VALUES ('8cf028c4-5bb3-4abf-84cf-7b3981275c53', '801b419a-0245-48ad-bbf1-899b436d2895', '5fff1a1e-2770-47f1-a148-6fa87763c807', 'e6732bef-7a55-4021-bbf2-a9d841079509', 7, '2026-07-07', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.323597');
INSERT INTO onepadel.match VALUES ('997eaf17-52c4-45a0-baa6-fcc42c8a9ff8', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '8dbb2b66-9764-4329-8859-0f1fcb1ba59d', '006c425f-d885-4818-a8cc-3949a1eaf318', 1, '2026-05-26', 18, 'Court 1', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.331988');
INSERT INTO onepadel.match VALUES ('0dd6b663-d55a-4a5f-8278-bb3c03b3fb11', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '3359e334-4e2b-4f1e-851f-8b1c060f3aac', 'a2890e63-6bfe-4c92-b45b-407033feb900', 1, '2026-05-26', 19, 'Court 2', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.333612');
INSERT INTO onepadel.match VALUES ('b0b9a870-3a29-48ff-a53b-a79a7c771309', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'ec184197-ec18-44e4-b3a3-a27fa20ee1b3', '447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', 1, '2026-05-26', 20, 'Court 3', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.335591');
INSERT INTO onepadel.match VALUES ('299d4f29-63c7-420c-badc-b30fd0cdc860', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '877b9541-3f38-400c-b9ee-e1bfe123fdf7', 'f5988285-fb61-432d-8ed9-31c3c5cb4496', 1, '2026-05-26', 21, 'Court 4', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.337146');
INSERT INTO onepadel.match VALUES ('06c7e36a-7bc3-4a44-9157-dc66df18e6e2', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '8dbb2b66-9764-4329-8859-0f1fcb1ba59d', 'a2890e63-6bfe-4c92-b45b-407033feb900', 2, '2026-06-02', 18, 'Court 1', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.338712');
INSERT INTO onepadel.match VALUES ('323aa651-f5db-4d0a-897e-597cf4f66d14', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '006c425f-d885-4818-a8cc-3949a1eaf318', '447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', 2, '2026-06-02', 19, 'Court 2', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.340287');
INSERT INTO onepadel.match VALUES ('38325ffc-172d-4138-89f7-4da3f022d066', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '3359e334-4e2b-4f1e-851f-8b1c060f3aac', 'f5988285-fb61-432d-8ed9-31c3c5cb4496', 2, '2026-06-02', 20, 'Court 3', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.341805');
INSERT INTO onepadel.match VALUES ('5686e9ff-c34e-4ade-98dc-d94b2b3c40e0', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'ec184197-ec18-44e4-b3a3-a27fa20ee1b3', '877b9541-3f38-400c-b9ee-e1bfe123fdf7', 2, '2026-06-02', 21, 'Court 4', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.343349');
INSERT INTO onepadel.match VALUES ('827bacd2-4f64-4518-9ea3-a4bbe3dae5b3', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '8dbb2b66-9764-4329-8859-0f1fcb1ba59d', '447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', 3, '2026-06-09', 18, 'Court 1', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.345055');
INSERT INTO onepadel.match VALUES ('b4e557b6-1ad1-4d11-9da7-ffba6d1ec72b', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'a2890e63-6bfe-4c92-b45b-407033feb900', 'f5988285-fb61-432d-8ed9-31c3c5cb4496', 3, '2026-06-09', 19, 'Court 2', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.346605');
INSERT INTO onepadel.match VALUES ('dfc08785-1556-4da4-beab-81417f55d931', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '006c425f-d885-4818-a8cc-3949a1eaf318', '877b9541-3f38-400c-b9ee-e1bfe123fdf7', 3, '2026-06-09', 20, 'Court 3', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.348156');
INSERT INTO onepadel.match VALUES ('2921f1da-a52b-4544-9ec4-77e07c9cc3cd', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '3359e334-4e2b-4f1e-851f-8b1c060f3aac', 'ec184197-ec18-44e4-b3a3-a27fa20ee1b3', 3, '2026-06-09', 21, 'Court 4', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.3497');
INSERT INTO onepadel.match VALUES ('1d005240-0894-44ee-8a86-d2959c211f6b', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '8dbb2b66-9764-4329-8859-0f1fcb1ba59d', 'f5988285-fb61-432d-8ed9-31c3c5cb4496', 4, '2026-06-16', 18, 'Court 1', 'LIVE', 1, 0, NULL, '2026-06-16 13:15:45.351404');
INSERT INTO onepadel.match VALUES ('930d57e8-8a40-4db7-9042-8913779fd44d', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', '877b9541-3f38-400c-b9ee-e1bfe123fdf7', 4, '2026-06-16', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.352979');
INSERT INTO onepadel.match VALUES ('eaeb9af9-d8a6-4e42-aa32-d41b8b55007a', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'a2890e63-6bfe-4c92-b45b-407033feb900', 'ec184197-ec18-44e4-b3a3-a27fa20ee1b3', 4, '2026-06-16', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.353578');
INSERT INTO onepadel.match VALUES ('e9cb4415-287e-47cf-9037-193428653bbe', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '006c425f-d885-4818-a8cc-3949a1eaf318', '3359e334-4e2b-4f1e-851f-8b1c060f3aac', 4, '2026-06-16', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.354254');
INSERT INTO onepadel.match VALUES ('fa93468d-79e6-488d-b91a-1881af352a6c', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '8dbb2b66-9764-4329-8859-0f1fcb1ba59d', '877b9541-3f38-400c-b9ee-e1bfe123fdf7', 5, '2026-06-23', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.356024');
INSERT INTO onepadel.match VALUES ('f2c6f7ec-1e63-4aed-ae6b-f074390c822f', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'f5988285-fb61-432d-8ed9-31c3c5cb4496', 'ec184197-ec18-44e4-b3a3-a27fa20ee1b3', 5, '2026-06-23', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.357249');
INSERT INTO onepadel.match VALUES ('3cb82a3d-c75d-446f-92dc-96455e1eb849', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', '3359e334-4e2b-4f1e-851f-8b1c060f3aac', 5, '2026-06-23', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.357922');
INSERT INTO onepadel.match VALUES ('9ff646c4-7256-4357-ab0f-c5d4ddb95eb6', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'a2890e63-6bfe-4c92-b45b-407033feb900', '006c425f-d885-4818-a8cc-3949a1eaf318', 5, '2026-06-23', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.358463');
INSERT INTO onepadel.match VALUES ('363aa067-eb51-4c38-8116-5fcf3565774c', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '8dbb2b66-9764-4329-8859-0f1fcb1ba59d', 'ec184197-ec18-44e4-b3a3-a27fa20ee1b3', 6, '2026-06-30', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.359125');
INSERT INTO onepadel.match VALUES ('18c7dd6a-c98c-481f-840f-feb44d5a14ed', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '877b9541-3f38-400c-b9ee-e1bfe123fdf7', '3359e334-4e2b-4f1e-851f-8b1c060f3aac', 6, '2026-06-30', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.359716');
INSERT INTO onepadel.match VALUES ('e2f6c2ea-01a0-41c1-96f3-2e01cd3b19e2', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'f5988285-fb61-432d-8ed9-31c3c5cb4496', '006c425f-d885-4818-a8cc-3949a1eaf318', 6, '2026-06-30', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.360317');
INSERT INTO onepadel.match VALUES ('63a2fee6-9e42-4e66-823f-ef0ae8a09aa6', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', 'a2890e63-6bfe-4c92-b45b-407033feb900', 6, '2026-06-30', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.360866');
INSERT INTO onepadel.match VALUES ('a615f7fc-d953-462a-b2d8-54edb440c653', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '8dbb2b66-9764-4329-8859-0f1fcb1ba59d', '3359e334-4e2b-4f1e-851f-8b1c060f3aac', 7, '2026-07-07', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.361467');
INSERT INTO onepadel.match VALUES ('6e1e4521-146f-4072-8c1d-4b1ff2b035a5', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'ec184197-ec18-44e4-b3a3-a27fa20ee1b3', '006c425f-d885-4818-a8cc-3949a1eaf318', 7, '2026-07-07', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.362063');
INSERT INTO onepadel.match VALUES ('6574451e-bf40-47a1-b82e-1c59a69d1738', '744a91f4-89e3-4725-8c36-3e7eb06b3042', '877b9541-3f38-400c-b9ee-e1bfe123fdf7', 'a2890e63-6bfe-4c92-b45b-407033feb900', 7, '2026-07-07', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.362633');
INSERT INTO onepadel.match VALUES ('9dd3ec1f-58fb-47aa-88c8-0cc1bf5e1d86', '744a91f4-89e3-4725-8c36-3e7eb06b3042', 'f5988285-fb61-432d-8ed9-31c3c5cb4496', '447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', 7, '2026-07-07', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.36326');
INSERT INTO onepadel.match VALUES ('fd292509-087e-4a36-9a02-70903fe7727d', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '97b3d6bf-8825-4cf5-bd8c-287705307a4b', '58a5c1e2-b251-49f5-9016-dc53c322c446', 1, '2026-05-26', 18, 'Court 1', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.370412');
INSERT INTO onepadel.match VALUES ('a3ff3bcc-065b-4cde-8116-6d8e914cb005', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '0c741125-5e59-4b0d-b26c-ab6059dc3ff3', '443bce52-6fd6-4cb2-9987-6dad6317f27d', 1, '2026-05-26', 19, 'Court 2', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.372136');
INSERT INTO onepadel.match VALUES ('17910251-1889-461b-8056-6f1d492c4253', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '990aaaf7-bb2b-4e19-807a-e25e6ec14a98', '91b0824c-1385-4060-aba5-c1fbc3c225b6', 1, '2026-05-26', 20, 'Court 3', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.373712');
INSERT INTO onepadel.match VALUES ('6bdb7c40-f8c0-4179-a41e-eff5d28ea086', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'd1466316-88c3-4217-9c96-bfd53567b819', 'f167eb89-1174-4150-8b20-3a1b689c9900', 1, '2026-05-26', 21, 'Court 4', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.37542');
INSERT INTO onepadel.match VALUES ('f898e004-9ee3-4b12-a372-6100a242342d', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '97b3d6bf-8825-4cf5-bd8c-287705307a4b', '443bce52-6fd6-4cb2-9987-6dad6317f27d', 2, '2026-06-02', 18, 'Court 1', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.377808');
INSERT INTO onepadel.match VALUES ('87cc3253-befc-467f-b271-3d80a9840b4c', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '58a5c1e2-b251-49f5-9016-dc53c322c446', '91b0824c-1385-4060-aba5-c1fbc3c225b6', 2, '2026-06-02', 19, 'Court 2', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.379413');
INSERT INTO onepadel.match VALUES ('0523bf07-776d-41c7-9b3b-1fcc81846a77', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '0c741125-5e59-4b0d-b26c-ab6059dc3ff3', 'f167eb89-1174-4150-8b20-3a1b689c9900', 2, '2026-06-02', 20, 'Court 3', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.380948');
INSERT INTO onepadel.match VALUES ('ef1722c3-91e6-4d68-87bf-564b6741762f', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '990aaaf7-bb2b-4e19-807a-e25e6ec14a98', 'd1466316-88c3-4217-9c96-bfd53567b819', 2, '2026-06-02', 21, 'Court 4', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.382483');
INSERT INTO onepadel.match VALUES ('7a3b1bdd-c6f2-4a88-b513-1fa92238e52c', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '97b3d6bf-8825-4cf5-bd8c-287705307a4b', '91b0824c-1385-4060-aba5-c1fbc3c225b6', 3, '2026-06-09', 18, 'Court 1', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.383939');
INSERT INTO onepadel.match VALUES ('2335e118-c1f8-4025-93ea-c1da2d3cb17c', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '443bce52-6fd6-4cb2-9987-6dad6317f27d', 'f167eb89-1174-4150-8b20-3a1b689c9900', 3, '2026-06-09', 19, 'Court 2', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.385346');
INSERT INTO onepadel.match VALUES ('b3a429dc-f8d7-4181-8f40-d1417c18b8b8', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '58a5c1e2-b251-49f5-9016-dc53c322c446', 'd1466316-88c3-4217-9c96-bfd53567b819', 3, '2026-06-09', 20, 'Court 3', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.386881');
INSERT INTO onepadel.match VALUES ('76ae39d0-ee87-4b18-bb2e-fd8eee769505', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '0c741125-5e59-4b0d-b26c-ab6059dc3ff3', '990aaaf7-bb2b-4e19-807a-e25e6ec14a98', 3, '2026-06-09', 21, 'Court 4', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.388338');
INSERT INTO onepadel.match VALUES ('bb80e635-ce79-4518-b27c-96c995a39db1', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '97b3d6bf-8825-4cf5-bd8c-287705307a4b', 'f167eb89-1174-4150-8b20-3a1b689c9900', 4, '2026-06-16', 18, 'Court 1', 'LIVE', 1, 0, NULL, '2026-06-16 13:15:45.38981');
INSERT INTO onepadel.match VALUES ('4ffe0014-fd14-4517-ae55-2f8fe52ccb9b', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '91b0824c-1385-4060-aba5-c1fbc3c225b6', 'd1466316-88c3-4217-9c96-bfd53567b819', 4, '2026-06-16', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.391169');
INSERT INTO onepadel.match VALUES ('cf8b8ea0-1524-4f06-a111-e7a02fc65096', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '443bce52-6fd6-4cb2-9987-6dad6317f27d', '990aaaf7-bb2b-4e19-807a-e25e6ec14a98', 4, '2026-06-16', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.391906');
INSERT INTO onepadel.match VALUES ('c470de6d-a2b8-4dc6-be5f-621e2674676d', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '58a5c1e2-b251-49f5-9016-dc53c322c446', '0c741125-5e59-4b0d-b26c-ab6059dc3ff3', 4, '2026-06-16', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.392499');
INSERT INTO onepadel.match VALUES ('d465630e-1927-492f-abe5-1b7ea5ef2968', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '97b3d6bf-8825-4cf5-bd8c-287705307a4b', 'd1466316-88c3-4217-9c96-bfd53567b819', 5, '2026-06-23', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.393091');
INSERT INTO onepadel.match VALUES ('44587fe1-e06f-447d-a126-f9f8bdbea390', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'f167eb89-1174-4150-8b20-3a1b689c9900', '990aaaf7-bb2b-4e19-807a-e25e6ec14a98', 5, '2026-06-23', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.393631');
INSERT INTO onepadel.match VALUES ('b922e6be-4d9e-492e-90b1-3efe9d053544', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '91b0824c-1385-4060-aba5-c1fbc3c225b6', '0c741125-5e59-4b0d-b26c-ab6059dc3ff3', 5, '2026-06-23', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.394244');
INSERT INTO onepadel.match VALUES ('24605a04-6c99-48e8-bb40-1bd2b8a26862', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '443bce52-6fd6-4cb2-9987-6dad6317f27d', '58a5c1e2-b251-49f5-9016-dc53c322c446', 5, '2026-06-23', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.394838');
INSERT INTO onepadel.match VALUES ('ac38285f-0b51-448b-b948-49a3dc28f11f', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '97b3d6bf-8825-4cf5-bd8c-287705307a4b', '990aaaf7-bb2b-4e19-807a-e25e6ec14a98', 6, '2026-06-30', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.395467');
INSERT INTO onepadel.match VALUES ('fa3effab-3072-45a3-8263-6b8c20da32a6', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'd1466316-88c3-4217-9c96-bfd53567b819', '0c741125-5e59-4b0d-b26c-ab6059dc3ff3', 6, '2026-06-30', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.395993');
INSERT INTO onepadel.match VALUES ('61a838a3-3f56-4c6d-ac8b-a1adaa5fce1a', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'f167eb89-1174-4150-8b20-3a1b689c9900', '58a5c1e2-b251-49f5-9016-dc53c322c446', 6, '2026-06-30', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.396587');
INSERT INTO onepadel.match VALUES ('ff6c7b18-1468-47af-8954-c40c866d063d', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '91b0824c-1385-4060-aba5-c1fbc3c225b6', '443bce52-6fd6-4cb2-9987-6dad6317f27d', 6, '2026-06-30', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.397138');
INSERT INTO onepadel.match VALUES ('d69e56e3-84e6-4055-8c04-a6c3ad0dfa83', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '97b3d6bf-8825-4cf5-bd8c-287705307a4b', '0c741125-5e59-4b0d-b26c-ab6059dc3ff3', 7, '2026-07-07', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.397709');
INSERT INTO onepadel.match VALUES ('88d6f012-9a5b-46a7-9bd4-16321e35aeb0', '6fad954b-f34c-4a03-8688-23d5a1c8b494', '990aaaf7-bb2b-4e19-807a-e25e6ec14a98', '58a5c1e2-b251-49f5-9016-dc53c322c446', 7, '2026-07-07', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.39831');
INSERT INTO onepadel.match VALUES ('36ab135d-b2a3-4cee-a4b0-8a5b02ac3655', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'd1466316-88c3-4217-9c96-bfd53567b819', '443bce52-6fd6-4cb2-9987-6dad6317f27d', 7, '2026-07-07', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.398966');
INSERT INTO onepadel.match VALUES ('4a50af35-774f-4e2a-9687-99d4d94c145a', '6fad954b-f34c-4a03-8688-23d5a1c8b494', 'f167eb89-1174-4150-8b20-3a1b689c9900', '91b0824c-1385-4060-aba5-c1fbc3c225b6', 7, '2026-07-07', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.399492');
INSERT INTO onepadel.match VALUES ('ed7ef8ab-358b-44d0-ac41-942e03eba16b', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'bcfc1607-ddc6-448c-9f4e-3578ef817318', '3609c983-e7f2-44df-a22d-26828bc0bb43', 1, '2026-05-26', 18, 'Court 1', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.405916');
INSERT INTO onepadel.match VALUES ('8e9f004e-635c-459d-a871-581041c8e2ac', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '43a95adc-f0b1-44b6-a898-e35f8273b4cb', 'e3913e97-ad99-4ff6-bb07-349d0b1c6445', 1, '2026-05-26', 19, 'Court 2', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.407516');
INSERT INTO onepadel.match VALUES ('261342c1-d932-45b3-aa02-d148e159583c', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', '62036e57-ead3-4f17-a90d-7881597efddb', 1, '2026-05-26', 20, 'Court 3', 'DONE', 0, 2, NULL, '2026-06-16 13:15:45.409048');
INSERT INTO onepadel.match VALUES ('4949f9bc-ba75-4b7d-8845-f1e05195b910', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '159caf31-9b0e-4300-bb9d-0f0f3fc51c06', 'de7c10d2-defe-4ab2-a010-7edbea31a48f', 1, '2026-05-26', 21, 'Court 4', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.4106');
INSERT INTO onepadel.match VALUES ('10ee5268-23b6-4cc9-9694-caf125cbf33b', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'bcfc1607-ddc6-448c-9f4e-3578ef817318', 'e3913e97-ad99-4ff6-bb07-349d0b1c6445', 2, '2026-06-02', 18, 'Court 1', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.412188');
INSERT INTO onepadel.match VALUES ('7cc10a9f-c892-47c2-a958-94a29b539cba', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '3609c983-e7f2-44df-a22d-26828bc0bb43', '62036e57-ead3-4f17-a90d-7881597efddb', 2, '2026-06-02', 19, 'Court 2', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.413852');
INSERT INTO onepadel.match VALUES ('23ac5443-f247-4c93-a15f-cf069575cbfe', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '43a95adc-f0b1-44b6-a898-e35f8273b4cb', 'de7c10d2-defe-4ab2-a010-7edbea31a48f', 2, '2026-06-02', 20, 'Court 3', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.41534');
INSERT INTO onepadel.match VALUES ('0d69da4e-8dd7-4274-9a70-4537fbbc5404', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', '159caf31-9b0e-4300-bb9d-0f0f3fc51c06', 2, '2026-06-02', 21, 'Court 4', 'DONE', 2, 0, NULL, '2026-06-16 13:15:45.416891');
INSERT INTO onepadel.match VALUES ('b37c8d1c-4ca3-41c2-811c-27a3ce40167e', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'bcfc1607-ddc6-448c-9f4e-3578ef817318', '62036e57-ead3-4f17-a90d-7881597efddb', 3, '2026-06-09', 18, 'Court 1', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.418468');
INSERT INTO onepadel.match VALUES ('1a39fa14-518e-4721-a4d2-055c0c3478dc', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'e3913e97-ad99-4ff6-bb07-349d0b1c6445', 'de7c10d2-defe-4ab2-a010-7edbea31a48f', 3, '2026-06-09', 19, 'Court 2', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.419949');
INSERT INTO onepadel.match VALUES ('0b906204-8ef4-41e3-9a7f-247f4119a058', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '3609c983-e7f2-44df-a22d-26828bc0bb43', '159caf31-9b0e-4300-bb9d-0f0f3fc51c06', 3, '2026-06-09', 20, 'Court 3', 'DONE', 2, 1, NULL, '2026-06-16 13:15:45.421463');
INSERT INTO onepadel.match VALUES ('20c9dd74-6739-4cce-a69c-c8e7f5c21b90', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '43a95adc-f0b1-44b6-a898-e35f8273b4cb', '179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', 3, '2026-06-09', 21, 'Court 4', 'DONE', 1, 2, NULL, '2026-06-16 13:15:45.422991');
INSERT INTO onepadel.match VALUES ('833ddeea-b935-4da2-b683-f128ab0fb261', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'bcfc1607-ddc6-448c-9f4e-3578ef817318', 'de7c10d2-defe-4ab2-a010-7edbea31a48f', 4, '2026-06-16', 18, 'Court 1', 'LIVE', 1, 0, NULL, '2026-06-16 13:15:45.424476');
INSERT INTO onepadel.match VALUES ('7b565fb5-3eed-46de-869a-f4109f984afd', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '62036e57-ead3-4f17-a90d-7881597efddb', '159caf31-9b0e-4300-bb9d-0f0f3fc51c06', 4, '2026-06-16', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.426006');
INSERT INTO onepadel.match VALUES ('dde584a0-0a01-4368-9b28-92c5743d46ae', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'e3913e97-ad99-4ff6-bb07-349d0b1c6445', '179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', 4, '2026-06-16', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.426597');
INSERT INTO onepadel.match VALUES ('d6195877-2dd1-4326-9ba2-b9c66a38b155', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '3609c983-e7f2-44df-a22d-26828bc0bb43', '43a95adc-f0b1-44b6-a898-e35f8273b4cb', 4, '2026-06-16', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.427158');
INSERT INTO onepadel.match VALUES ('9aa7b06e-7d1b-4240-afba-cc352f5c27cb', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'bcfc1607-ddc6-448c-9f4e-3578ef817318', '159caf31-9b0e-4300-bb9d-0f0f3fc51c06', 5, '2026-06-23', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.427713');
INSERT INTO onepadel.match VALUES ('4d605a5e-8e92-48ea-9c71-0b7027835f7d', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'de7c10d2-defe-4ab2-a010-7edbea31a48f', '179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', 5, '2026-06-23', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.428876');
INSERT INTO onepadel.match VALUES ('4f07fafc-8f33-4dc7-a7f7-69564c775028', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '62036e57-ead3-4f17-a90d-7881597efddb', '43a95adc-f0b1-44b6-a898-e35f8273b4cb', 5, '2026-06-23', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.429488');
INSERT INTO onepadel.match VALUES ('b14ab13c-53e0-4329-a4c5-e48d74983b68', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'e3913e97-ad99-4ff6-bb07-349d0b1c6445', '3609c983-e7f2-44df-a22d-26828bc0bb43', 5, '2026-06-23', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.430131');
INSERT INTO onepadel.match VALUES ('19f632a4-5f6e-424b-8629-cf8c3abc066e', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'bcfc1607-ddc6-448c-9f4e-3578ef817318', '179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', 6, '2026-06-30', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.430646');
INSERT INTO onepadel.match VALUES ('88b17d9f-2c43-432e-8d5d-47779a188cd0', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '159caf31-9b0e-4300-bb9d-0f0f3fc51c06', '43a95adc-f0b1-44b6-a898-e35f8273b4cb', 6, '2026-06-30', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.43117');
INSERT INTO onepadel.match VALUES ('3538ca6e-1fc8-4316-9552-ab9fdf947546', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'de7c10d2-defe-4ab2-a010-7edbea31a48f', '3609c983-e7f2-44df-a22d-26828bc0bb43', 6, '2026-06-30', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.431696');
INSERT INTO onepadel.match VALUES ('c8e27236-ba45-4aa8-bfaf-2cde75505e30', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '62036e57-ead3-4f17-a90d-7881597efddb', 'e3913e97-ad99-4ff6-bb07-349d0b1c6445', 6, '2026-06-30', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.432315');
INSERT INTO onepadel.match VALUES ('872fa65b-b32f-4ef8-89c9-534059708287', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'bcfc1607-ddc6-448c-9f4e-3578ef817318', '43a95adc-f0b1-44b6-a898-e35f8273b4cb', 7, '2026-07-07', 18, 'Court 1', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.432897');
INSERT INTO onepadel.match VALUES ('470ff1bd-f8ce-4ffe-81ad-be61ac107734', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', '3609c983-e7f2-44df-a22d-26828bc0bb43', 7, '2026-07-07', 19, 'Court 2', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.433404');
INSERT INTO onepadel.match VALUES ('dea2ffbe-b4ba-470d-b164-0789d2ce42ef', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', '159caf31-9b0e-4300-bb9d-0f0f3fc51c06', 'e3913e97-ad99-4ff6-bb07-349d0b1c6445', 7, '2026-07-07', 20, 'Court 3', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.434013');
INSERT INTO onepadel.match VALUES ('606cf8cb-c5ec-484a-b024-3a6f26448823', 'c71c668d-47fd-4c9f-9db0-ba429b417edc', 'de7c10d2-defe-4ab2-a010-7edbea31a48f', '62036e57-ead3-4f17-a90d-7881597efddb', 7, '2026-07-07', 21, 'Court 4', 'SCHEDULED', 0, 0, NULL, '2026-06-16 13:15:45.434543');


--
-- Data for Name: game; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.game VALUES ('8209cd6f-598f-4c7d-aa78-d08069c96dbf', 'c97b744f-9d23-4bea-b0b0-2bf37d8ec239', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('cfe1b5b7-3bdf-49e5-9ccf-1411edfd708e', 'c97b744f-9d23-4bea-b0b0-2bf37d8ec239', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('246c75d0-9b35-4076-898b-ceb8f9d9f4f7', 'a3c7c0b2-91d1-4552-97ed-2061a1db1924', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('6fe12c50-16ab-4156-9a2a-602460fdbec9', 'a3c7c0b2-91d1-4552-97ed-2061a1db1924', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('85e3cca6-163a-46e6-bc60-3276eca1215e', 'b76a20a8-3515-40a5-8338-7db6af0089be', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('1bd98d3a-86ff-4375-ac24-0612830f5bd4', 'b76a20a8-3515-40a5-8338-7db6af0089be', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('46c30b8b-cf35-423f-b33e-bb3d713b5d57', 'b76a20a8-3515-40a5-8338-7db6af0089be', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('7ba8108e-06ef-4f5f-a9cc-f7c33c9f444c', '309668ae-bccc-48ff-9d05-c75eab572afd', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('a1dfebfe-bbf4-4ddf-b36e-85cc310b07ce', '309668ae-bccc-48ff-9d05-c75eab572afd', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('5a23c588-8807-42b1-8fec-9d6c5f6369b1', '2a92ffa1-e917-4acf-958d-c6fcbd2b1a8d', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('8c1f82d4-9a9a-4658-9025-705c740cadeb', '2a92ffa1-e917-4acf-958d-c6fcbd2b1a8d', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('f67c415f-6f7b-4b22-ab5d-1d8c6e6aa1de', '2a92ffa1-e917-4acf-958d-c6fcbd2b1a8d', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('5bac0c9a-339e-4f49-ab9e-5b850c08477b', '094ecdbe-8d96-450f-9681-8c41f0aa938d', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('b3cb475f-64b8-45e7-a140-77671097cd1b', '094ecdbe-8d96-450f-9681-8c41f0aa938d', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('142994b2-6fcd-41ec-815a-d76518766156', '094ecdbe-8d96-450f-9681-8c41f0aa938d', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('65d1d4ee-9c38-4ba5-bdfe-84b6861dc349', '495ba141-60e9-4aab-99a7-e678e44c3263', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('2e4af3f7-b464-4818-87a9-99439e2faba3', '495ba141-60e9-4aab-99a7-e678e44c3263', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('e73c446e-d266-434d-b0ec-b5bc7a59e9b6', '41924142-a09d-4847-bed8-7cace0e47a65', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('7b8803b2-533f-439d-896c-5da931800460', '41924142-a09d-4847-bed8-7cace0e47a65', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('b6f2f35c-211a-4619-8a55-b6c702a6e50d', '41924142-a09d-4847-bed8-7cace0e47a65', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('ea459ef0-ed30-4656-bec9-44f83213897f', '7a74e47f-404f-44ef-b81f-c997f6f04344', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('89b96204-0e1a-4c85-9df8-7d457b11709c', '7a74e47f-404f-44ef-b81f-c997f6f04344', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('a32938a5-edab-4ebf-87a2-724271dc5115', 'e227f646-9f09-40ee-8053-1c59eaba7f66', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('e6ae4ea5-6184-4a6e-bcae-e0b7ca42ac96', 'e227f646-9f09-40ee-8053-1c59eaba7f66', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('9bb4b45a-466c-432b-8ba0-6946a76fb672', 'e227f646-9f09-40ee-8053-1c59eaba7f66', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('1820767a-c8c8-4cf1-a1a7-981a6d97d6e2', '1f0b09ef-f61c-4126-978b-7361b8842dcd', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('b231ae7f-6c4c-4514-8ce4-877752ed3752', '1f0b09ef-f61c-4126-978b-7361b8842dcd', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('c9081564-7b1d-42f1-89c5-392272090eea', 'beefabaa-b16e-43b5-a790-4bbe884cb0d2', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('bb3a4fba-977c-40c7-8b03-47d7bdb72ae6', '997eaf17-52c4-45a0-baa6-fcc42c8a9ff8', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('851e17c4-4e4c-4e5c-aa86-3a71bb8d3dd8', '997eaf17-52c4-45a0-baa6-fcc42c8a9ff8', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('690ffb4d-d404-4841-9993-df9b2e798c8a', '997eaf17-52c4-45a0-baa6-fcc42c8a9ff8', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('1cadb86b-3fb3-4eb3-9eb5-f46f72ef8434', '0dd6b663-d55a-4a5f-8278-bb3c03b3fb11', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('a5a78b86-2f5b-4f67-b00c-c24664601f26', '0dd6b663-d55a-4a5f-8278-bb3c03b3fb11', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('ca7c9c82-5200-426b-a2e7-1b090e6f214a', '0dd6b663-d55a-4a5f-8278-bb3c03b3fb11', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('ec81f67b-7e85-40dc-8ddb-65dce3fd9a98', 'b0b9a870-3a29-48ff-a53b-a79a7c771309', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('d0ca59e1-0f27-4544-b428-e84977dc4920', 'b0b9a870-3a29-48ff-a53b-a79a7c771309', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('64222196-0c40-4ca1-8443-1bb84f4528ee', '299d4f29-63c7-420c-badc-b30fd0cdc860', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('1a349657-c3e0-47c2-8344-1583aa9b16f8', '299d4f29-63c7-420c-badc-b30fd0cdc860', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('6b782dea-4daf-4da7-ac21-9967f7a6711a', '06c7e36a-7bc3-4a44-9157-dc66df18e6e2', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('2f19f0dc-044e-4968-ad61-f307a38f6809', '06c7e36a-7bc3-4a44-9157-dc66df18e6e2', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('2fb5a748-13e1-43f4-806e-df34e289cbec', '323aa651-f5db-4d0a-897e-597cf4f66d14', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('a6ad42fe-c83e-4a5e-8ed3-37b1a4989793', '323aa651-f5db-4d0a-897e-597cf4f66d14', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('11528468-f895-47a8-ac6b-23cb88caac9f', '38325ffc-172d-4138-89f7-4da3f022d066', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('75d8e24b-49d3-4bf8-adad-1cba51b76b95', '38325ffc-172d-4138-89f7-4da3f022d066', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('850dd954-6fdb-49c5-bc4f-3cd56f11a0b6', '5686e9ff-c34e-4ade-98dc-d94b2b3c40e0', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('c21b5c5f-f011-46b1-bf52-d6e9e9c8e80f', '5686e9ff-c34e-4ade-98dc-d94b2b3c40e0', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('45903bce-74ab-4a74-ac3f-ad60a2fb4919', '5686e9ff-c34e-4ade-98dc-d94b2b3c40e0', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('181b4fb8-d4ca-4742-9d49-1c185d75ae9d', '827bacd2-4f64-4518-9ea3-a4bbe3dae5b3', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('8cccff96-c4bf-4b00-a4b8-a397db2fa356', '827bacd2-4f64-4518-9ea3-a4bbe3dae5b3', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('3c021376-0661-4944-b91d-80fc7d9e0ab3', '827bacd2-4f64-4518-9ea3-a4bbe3dae5b3', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('15052ce3-ccd2-4552-833b-a509e920c49e', 'b4e557b6-1ad1-4d11-9da7-ffba6d1ec72b', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('4bbe5639-ddc1-43f9-a0c2-f521649ab097', 'b4e557b6-1ad1-4d11-9da7-ffba6d1ec72b', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('04e7c88e-47b2-4619-8278-f84d55119085', 'b4e557b6-1ad1-4d11-9da7-ffba6d1ec72b', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('01e2e811-60da-48b2-b39d-41b3e36146ab', 'dfc08785-1556-4da4-beab-81417f55d931', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('d8578769-6799-4a24-b301-15683c37d824', 'dfc08785-1556-4da4-beab-81417f55d931', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('2bf41176-437b-41dc-bf34-ab21ccc14d3e', '2921f1da-a52b-4544-9ec4-77e07c9cc3cd', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('a976ad39-8b55-4b52-a841-c933cc34817f', '2921f1da-a52b-4544-9ec4-77e07c9cc3cd', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('f7e7a96f-0743-4edc-ba40-c1a6ac9a7faf', '1d005240-0894-44ee-8a86-d2959c211f6b', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('e837fb5d-a344-44e9-a185-fc5e9a8c2e59', 'fd292509-087e-4a36-9a02-70903fe7727d', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('5d6169ca-5d33-4ff5-b02a-70e966a86fcc', 'fd292509-087e-4a36-9a02-70903fe7727d', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('5bb6dce4-76e5-4d36-93d2-f1973ee459c6', 'fd292509-087e-4a36-9a02-70903fe7727d', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('8e86d197-2262-4008-a1f2-34596ce0e8e0', 'a3ff3bcc-065b-4cde-8116-6d8e914cb005', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('7569fc04-aeb1-42d3-8c12-8880f08edacb', 'a3ff3bcc-065b-4cde-8116-6d8e914cb005', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('a5dc45f7-2f73-47d6-a139-9f84f2648b13', 'a3ff3bcc-065b-4cde-8116-6d8e914cb005', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('874d9c75-c6ab-4e1d-927b-371a134db153', '17910251-1889-461b-8056-6f1d492c4253', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('81b484e3-b872-4441-a441-6ff374b8ec99', '17910251-1889-461b-8056-6f1d492c4253', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('27ca713f-8bc6-4ea5-88c7-868cfb52b096', '6bdb7c40-f8c0-4179-a41e-eff5d28ea086', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('ec210da4-892d-4e1a-a773-a2fc5a406e66', '6bdb7c40-f8c0-4179-a41e-eff5d28ea086', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('d0f539de-8e81-41ef-80c8-cb0490184ecf', 'f898e004-9ee3-4b12-a372-6100a242342d', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('b35147ed-7a75-49af-88f6-f412c70643e9', 'f898e004-9ee3-4b12-a372-6100a242342d', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('dfeda4be-a3c3-42ce-b8eb-1a0d97b81d0b', 'f898e004-9ee3-4b12-a372-6100a242342d', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('bdb8079f-f013-45b8-9d3b-3336bfa564eb', '87cc3253-befc-467f-b271-3d80a9840b4c', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('68bd6f3c-d1fc-4043-a30f-37041364f839', '87cc3253-befc-467f-b271-3d80a9840b4c', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('3e801aa6-44fc-4182-99d4-2ec13557c8c3', '0523bf07-776d-41c7-9b3b-1fcc81846a77', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('8114569a-8371-47b0-a391-c711c359dbea', '0523bf07-776d-41c7-9b3b-1fcc81846a77', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('87eb4af3-3f7c-431c-9964-d087a3485ea4', 'ef1722c3-91e6-4d68-87bf-564b6741762f', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('39590285-5efd-4726-b952-f73a094ccfd3', 'ef1722c3-91e6-4d68-87bf-564b6741762f', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('3ce44d59-6f07-4605-b7fe-9b49debace60', '7a3b1bdd-c6f2-4a88-b513-1fa92238e52c', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('d678fb78-9f89-438a-8a3b-db0ca32723f3', '7a3b1bdd-c6f2-4a88-b513-1fa92238e52c', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('ae181b48-6802-4ceb-8b4d-4d42e2cbe614', '2335e118-c1f8-4025-93ea-c1da2d3cb17c', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('be69defb-d63f-4414-bb69-fa9fa1c36907', '2335e118-c1f8-4025-93ea-c1da2d3cb17c', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('ceda56e9-afee-4bd2-b300-16d9ef751a12', '2335e118-c1f8-4025-93ea-c1da2d3cb17c', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('a1caaaab-62d0-45e1-a0bf-9f89396634ce', 'b3a429dc-f8d7-4181-8f40-d1417c18b8b8', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('7ca18bce-fe9e-49aa-8705-0046c4f40478', 'b3a429dc-f8d7-4181-8f40-d1417c18b8b8', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('d8235358-5827-47f9-b866-3dafacc1252e', '76ae39d0-ee87-4b18-bb2e-fd8eee769505', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('47df21f1-9439-4bd1-a84f-cbf3e546a381', '76ae39d0-ee87-4b18-bb2e-fd8eee769505', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('f114ae9f-a902-4309-b64b-b837716bb21e', 'bb80e635-ce79-4518-b27c-96c995a39db1', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('807a0c25-9a71-428d-8d47-e3626439dd5a', 'ed7ef8ab-358b-44d0-ac41-942e03eba16b', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('48ab7124-2a33-43f9-9cb1-e185cf6aff21', 'ed7ef8ab-358b-44d0-ac41-942e03eba16b', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('7b21fc36-8e65-4f16-9296-a9730c27f919', 'ed7ef8ab-358b-44d0-ac41-942e03eba16b', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('d736a0f5-7238-4031-bbc7-8c7aed5ab961', '8e9f004e-635c-459d-a871-581041c8e2ac', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('99b4d84d-fc8e-4cd3-8dd6-87ba760dc522', '8e9f004e-635c-459d-a871-581041c8e2ac', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('7c9faf43-e694-4eca-9f55-7402ab1fad27', '261342c1-d932-45b3-aa02-d148e159583c', 1, 'B', NULL);
INSERT INTO onepadel.game VALUES ('e00e7e2d-f6f0-41ca-98a8-c7019d3c53c0', '261342c1-d932-45b3-aa02-d148e159583c', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('4b187e09-c834-4f9b-b6e7-371dd3f6f83a', '4949f9bc-ba75-4b7d-8845-f1e05195b910', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('4d8e3ddb-0fc3-4a71-b220-a9f49de7e0b0', '4949f9bc-ba75-4b7d-8845-f1e05195b910', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('c203a088-ed65-42c1-bc76-de871bfe6b2b', '10ee5268-23b6-4cc9-9694-caf125cbf33b', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('fb3661fc-935b-41b1-a864-da799fe2cf2c', '10ee5268-23b6-4cc9-9694-caf125cbf33b', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('36301d47-8916-49a4-bce6-b9574f421f15', '7cc10a9f-c892-47c2-a958-94a29b539cba', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('909f135c-b49c-49ba-b4fe-0eb1be152ace', '7cc10a9f-c892-47c2-a958-94a29b539cba', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('4ed8f890-2a3d-4965-81fb-30b4652a4ddf', '23ac5443-f247-4c93-a15f-cf069575cbfe', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('487a7019-6fa2-44e2-86a6-bb17ee0b451e', '23ac5443-f247-4c93-a15f-cf069575cbfe', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('396b16df-13e5-4188-91ce-ea230b4b9885', '0d69da4e-8dd7-4274-9a70-4537fbbc5404', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('d55faea9-c517-4416-b66f-9b2c4477f195', '0d69da4e-8dd7-4274-9a70-4537fbbc5404', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('b4867368-16bb-40b6-ae39-b6da2832d866', 'b37c8d1c-4ca3-41c2-811c-27a3ce40167e', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('14c7e7ef-0453-44cf-aaa5-ebcba491c32c', 'b37c8d1c-4ca3-41c2-811c-27a3ce40167e', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('27d19968-92b6-4f23-aef5-7cb66ab4a35f', 'b37c8d1c-4ca3-41c2-811c-27a3ce40167e', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('1e9ac385-8f3b-47c4-a6f3-c10adf48acf3', '1a39fa14-518e-4721-a4d2-055c0c3478dc', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('17e39379-4a69-46d8-876a-b171fa9ebeed', '1a39fa14-518e-4721-a4d2-055c0c3478dc', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('a587de0a-9e64-4feb-b466-8b0599582203', '1a39fa14-518e-4721-a4d2-055c0c3478dc', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('592293eb-d760-4f3d-8ab1-460efda6d2c3', '0b906204-8ef4-41e3-9a7f-247f4119a058', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('c5cdc139-49df-4b68-8c23-b65662156b37', '0b906204-8ef4-41e3-9a7f-247f4119a058', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('6f32062d-e33b-4c29-8101-f18e456df69d', '0b906204-8ef4-41e3-9a7f-247f4119a058', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('db2e6113-1ae2-4764-8194-c5b05008610b', '20c9dd74-6739-4cce-a69c-c8e7f5c21b90', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('68679271-f708-45bc-a0d8-87598d67999a', '20c9dd74-6739-4cce-a69c-c8e7f5c21b90', 2, 'B', NULL);
INSERT INTO onepadel.game VALUES ('f6bd2af6-2b77-4713-bd17-e8573922fcef', '20c9dd74-6739-4cce-a69c-c8e7f5c21b90', 3, 'B', NULL);
INSERT INTO onepadel.game VALUES ('45661ec9-e6de-405e-80ec-f9e5a4b2cbc1', '833ddeea-b935-4da2-b683-f128ab0fb261', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('7b0ba692-984e-4c0c-86b6-0239b3061a5f', '0b895ce5-3e12-45a4-9291-692f41b8dd8a', 1, 'A', NULL);
INSERT INTO onepadel.game VALUES ('f35d6048-4f31-458c-8945-a03014a7355f', '0b895ce5-3e12-45a4-9291-692f41b8dd8a', 2, 'A', NULL);
INSERT INTO onepadel.game VALUES ('77afb652-ab8b-44a1-92cb-cda496143ff7', '0b895ce5-3e12-45a4-9291-692f41b8dd8a', 3, 'B', NULL);


--
-- Data for Name: hall_of_fame; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.hall_of_fame VALUES ('5a2b5b46-48f4-4b31-afae-8b4db98f6650', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'e0574327-7b35-48eb-a3c6-e1f6fbca822a', 'Tim Alpha', 'Champion', NULL, 'Juara Upper Beginner Pria Liga 1');
INSERT INTO onepadel.hall_of_fame VALUES ('ba1f8e08-8c72-4e2c-87ed-3693e362dcd4', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'e0574327-7b35-48eb-a3c6-e1f6fbca822a', 'Andi R.', 'MVP', NULL, 'Pemain terbaik season');
INSERT INTO onepadel.hall_of_fame VALUES ('04c29fb0-00ee-4c21-bede-af3a9955c285', 'f43a8e2d-c524-44db-9eae-478afbd15f1b', 'ac854666-4ca4-49fd-b8ea-3e8c27a21454', 'Tim Bravo', 'Best Pair', NULL, 'Pasangan terbaik');


--
-- Data for Name: membership_plan; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.membership_plan VALUES ('b091df88-05e1-4eaa-ab84-4340ef0d876e', 'Pro', 750000, 30, 'Diskon 20% sewa lapangan
Prioritas booking H-14
Gratis 3 sesi open play
Diskon 10% coaching', true, 2, '2026-06-16 12:43:30.782393', 0);
INSERT INTO onepadel.membership_plan VALUES ('495e29b7-1516-4ea3-ad5b-0ca66364e081', 'Elite', 1500000, 30, 'Diskon 35% sewa lapangan
Prioritas booking penuh
Open play tanpa batas
Diskon 20% coaching
Merchandise eksklusif', true, 3, '2026-06-16 12:43:30.782393', 0);
INSERT INTO onepadel.membership_plan VALUES ('10d5d773-61b5-4fc8-9aab-d1fe5704ecd6', 'Starter', 350000, 30, 'Diskon 10% sewa lapangan
Prioritas booking H-7
Gratis 1 sesi open play', true, 1, '2026-06-16 12:43:30.782393', 0);


--
-- Data for Name: open_play_session; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.open_play_session VALUES ('be1431c1-6073-47ba-8f16-7d45fe2afd56', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', '524fa746-de03-4198-8523-670d3981dbee', 'Open Play Malam', 'Intermediate', '2026-06-17', 19, 2, 8, 50000, 'OPEN', NULL, '2026-06-16 12:43:30.786561');
INSERT INTO onepadel.open_play_session VALUES ('54670a06-3e70-4c58-be34-74fa2057025d', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', '524fa746-de03-4198-8523-670d3981dbee', 'Mabar Santai', 'Beginner', '2026-06-17', 16, 2, 8, 45000, 'OPEN', NULL, '2026-06-16 12:43:30.786561');


--
-- Data for Name: player; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.player VALUES ('f8cce52f-6a40-4c11-8743-81e54113da4d', '58aaa69d-cb1c-4aab-a038-abec55089d6b', 'Andi R.', 'https://ui-avatars.com/api/?name=Andi%20R.&background=1a4d33&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('e37fb17c-b925-4216-bc5d-576b6d35fa5e', '58aaa69d-cb1c-4aab-a038-abec55089d6b', 'Budi S.', 'https://ui-avatars.com/api/?name=Budi%20S.&background=1a4d33&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('e7e9b4e5-1b3b-4abd-a77f-59fe6d9bc6c7', '0cf7fdd3-d4b1-4000-8708-e87a5080597e', 'Eko P.', 'https://ui-avatars.com/api/?name=Eko%20P.&background=d97721&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('13c94b49-cfbd-4c6d-ad3e-8e5f42c462b5', '0cf7fdd3-d4b1-4000-8708-e87a5080597e', 'Fajar M.', 'https://ui-avatars.com/api/?name=Fajar%20M.&background=d97721&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('ee3f03ac-ab71-45d9-8e0d-a28ace24ea9d', '39d8d892-f5f2-4965-9aa2-efcbd161b74e', 'Ivan K.', 'https://ui-avatars.com/api/?name=Ivan%20K.&background=2563eb&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('60c283d8-bead-4233-b241-fd6f5dd696ad', '39d8d892-f5f2-4965-9aa2-efcbd161b74e', 'Joko L.', 'https://ui-avatars.com/api/?name=Joko%20L.&background=2563eb&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('de036664-d50b-4c55-b3a3-cfd2999f27d3', '799a2219-d101-4d2d-947e-2cc5927d31e1', 'Mario T.', 'https://ui-avatars.com/api/?name=Mario%20T.&background=9333ea&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('4112eae7-212b-42b0-9d7c-9a66506fb464', '799a2219-d101-4d2d-947e-2cc5927d31e1', 'Nanda W.', 'https://ui-avatars.com/api/?name=Nanda%20W.&background=9333ea&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('26006389-29c9-41e5-b057-74d09a098bbb', '5fff1a1e-2770-47f1-a148-6fa87763c807', 'Raka S.', 'https://ui-avatars.com/api/?name=Raka%20S.&background=dc2626&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('d487ed84-7a93-4e6e-8e83-7d6be2980fec', '5fff1a1e-2770-47f1-a148-6fa87763c807', 'Surya N.', 'https://ui-avatars.com/api/?name=Surya%20N.&background=dc2626&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('c3976d34-e4db-401d-9d60-e15026b9e4f3', 'e6732bef-7a55-4021-bbf2-a9d841079509', 'Vino H.', 'https://ui-avatars.com/api/?name=Vino%20H.&background=0891b2&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('f0902345-b2b6-40ad-9ec6-144bad839057', 'e6732bef-7a55-4021-bbf2-a9d841079509', 'Wahyu P.', 'https://ui-avatars.com/api/?name=Wahyu%20P.&background=0891b2&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('3aa09397-27ba-423d-ad49-fb435b8cc152', '36deeb11-c11a-42ef-8b1c-f08878248731', 'Zaki M.', 'https://ui-avatars.com/api/?name=Zaki%20M.&background=ca8a04&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('b809f9a1-6a76-4ebb-8ca6-1b29a50c07a9', '36deeb11-c11a-42ef-8b1c-f08878248731', 'Agus R.', 'https://ui-avatars.com/api/?name=Agus%20R.&background=ca8a04&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('8eaed5f9-9faa-4192-a0d6-711039378f05', '752433b7-6cb8-4733-8234-a4c541581704', 'Dewa K.', 'https://ui-avatars.com/api/?name=Dewa%20K.&background=475569&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('6fa77fc2-6df2-4b11-8bb2-2cb38383fbf5', '752433b7-6cb8-4733-8234-a4c541581704', 'Eka F.', 'https://ui-avatars.com/api/?name=Eka%20F.&background=475569&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('ef39b73e-5474-418e-a7ec-999a5a1e89b6', '8dbb2b66-9764-4329-8859-0f1fcb1ba59d', 'Pemain Alpha 1', 'https://ui-avatars.com/api/?name=Pemain%20Alpha%201&background=1a4d33&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('b4955e0d-a355-49e3-bd49-289901b3291e', '8dbb2b66-9764-4329-8859-0f1fcb1ba59d', 'Pemain Alpha 2', 'https://ui-avatars.com/api/?name=Pemain%20Alpha%202&background=1a4d33&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('f36987d9-6ecb-4d50-8d38-e5654138c8ec', '3359e334-4e2b-4f1e-851f-8b1c060f3aac', 'Pemain Bravo 1', 'https://ui-avatars.com/api/?name=Pemain%20Bravo%201&background=d97721&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('8572915d-b8da-4555-844d-87b0a1f4ddaf', '3359e334-4e2b-4f1e-851f-8b1c060f3aac', 'Pemain Bravo 2', 'https://ui-avatars.com/api/?name=Pemain%20Bravo%202&background=d97721&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('085cf452-4e3c-4eac-a43a-981bba9f107c', 'ec184197-ec18-44e4-b3a3-a27fa20ee1b3', 'Pemain Charlie 1', 'https://ui-avatars.com/api/?name=Pemain%20Charlie%201&background=2563eb&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('ece162f4-8a02-4b33-aaec-0beef2b30cd3', 'ec184197-ec18-44e4-b3a3-a27fa20ee1b3', 'Pemain Charlie 2', 'https://ui-avatars.com/api/?name=Pemain%20Charlie%202&background=2563eb&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('9366a84a-21ce-4ff2-b115-ae7d50ce49ed', '877b9541-3f38-400c-b9ee-e1bfe123fdf7', 'Pemain Delta 1', 'https://ui-avatars.com/api/?name=Pemain%20Delta%201&background=9333ea&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('d77b1117-0d9a-4db4-ba97-4709b8b758f0', '877b9541-3f38-400c-b9ee-e1bfe123fdf7', 'Pemain Delta 2', 'https://ui-avatars.com/api/?name=Pemain%20Delta%202&background=9333ea&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('155d181f-d771-48b2-97d7-28e0c028fe89', 'f5988285-fb61-432d-8ed9-31c3c5cb4496', 'Pemain Echo 1', 'https://ui-avatars.com/api/?name=Pemain%20Echo%201&background=dc2626&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('d02ef328-7baa-4ec9-8d77-1d55d35edad7', 'f5988285-fb61-432d-8ed9-31c3c5cb4496', 'Pemain Echo 2', 'https://ui-avatars.com/api/?name=Pemain%20Echo%202&background=dc2626&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('2943a511-d047-4205-9355-83987cad68e3', '447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', 'Pemain Foxtrot 1', 'https://ui-avatars.com/api/?name=Pemain%20Foxtrot%201&background=0891b2&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('fe9c8802-c0d1-44f2-b9e0-7bd0663fd096', '447c5a8d-7edf-4a7d-a97c-1ff376ff0c9c', 'Pemain Foxtrot 2', 'https://ui-avatars.com/api/?name=Pemain%20Foxtrot%202&background=0891b2&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('31c6d109-8792-444b-bd2f-982decdf343c', 'a2890e63-6bfe-4c92-b45b-407033feb900', 'Pemain Golf 1', 'https://ui-avatars.com/api/?name=Pemain%20Golf%201&background=ca8a04&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('1b8f6c51-4484-4b56-819a-083d63901105', 'a2890e63-6bfe-4c92-b45b-407033feb900', 'Pemain Golf 2', 'https://ui-avatars.com/api/?name=Pemain%20Golf%202&background=ca8a04&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('5ec7c293-3895-4e19-81c5-433001de40c7', '006c425f-d885-4818-a8cc-3949a1eaf318', 'Pemain Hotel 1', 'https://ui-avatars.com/api/?name=Pemain%20Hotel%201&background=475569&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('ee25eff3-3fc2-4d33-bcf3-713edec4f5ba', '006c425f-d885-4818-a8cc-3949a1eaf318', 'Pemain Hotel 2', 'https://ui-avatars.com/api/?name=Pemain%20Hotel%202&background=475569&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('ed975ccf-9264-41d2-ad02-f4ebb52014e2', '97b3d6bf-8825-4cf5-bd8c-287705307a4b', 'Pemain Alpha 1', 'https://ui-avatars.com/api/?name=Pemain%20Alpha%201&background=1a4d33&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('09a90e21-9083-4df0-ae6d-f0fed477461e', '97b3d6bf-8825-4cf5-bd8c-287705307a4b', 'Pemain Alpha 2', 'https://ui-avatars.com/api/?name=Pemain%20Alpha%202&background=1a4d33&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('7e38b492-d2a3-4a01-90c2-3c9c2e3a4a06', '0c741125-5e59-4b0d-b26c-ab6059dc3ff3', 'Pemain Bravo 1', 'https://ui-avatars.com/api/?name=Pemain%20Bravo%201&background=d97721&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('6206164a-0580-44df-93e6-ae1c164b266c', '0c741125-5e59-4b0d-b26c-ab6059dc3ff3', 'Pemain Bravo 2', 'https://ui-avatars.com/api/?name=Pemain%20Bravo%202&background=d97721&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('99176658-0ca1-4e9b-995c-0465d97031fd', '990aaaf7-bb2b-4e19-807a-e25e6ec14a98', 'Pemain Charlie 1', 'https://ui-avatars.com/api/?name=Pemain%20Charlie%201&background=2563eb&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('836e59f7-0a43-4926-ae24-bbd08bf882c7', '990aaaf7-bb2b-4e19-807a-e25e6ec14a98', 'Pemain Charlie 2', 'https://ui-avatars.com/api/?name=Pemain%20Charlie%202&background=2563eb&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('0e125b37-9149-41f5-ae94-29a015243c99', 'd1466316-88c3-4217-9c96-bfd53567b819', 'Pemain Delta 1', 'https://ui-avatars.com/api/?name=Pemain%20Delta%201&background=9333ea&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('0cc76d94-eec9-4806-8530-3e1963a055b5', 'd1466316-88c3-4217-9c96-bfd53567b819', 'Pemain Delta 2', 'https://ui-avatars.com/api/?name=Pemain%20Delta%202&background=9333ea&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('0991d625-02a5-45d1-9d88-b3cd5fd7b324', 'f167eb89-1174-4150-8b20-3a1b689c9900', 'Pemain Echo 1', 'https://ui-avatars.com/api/?name=Pemain%20Echo%201&background=dc2626&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('c6f247f8-b9bc-462c-aef3-f9a30fd9e164', 'f167eb89-1174-4150-8b20-3a1b689c9900', 'Pemain Echo 2', 'https://ui-avatars.com/api/?name=Pemain%20Echo%202&background=dc2626&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('3a9a62be-3da6-47f5-bf5e-631516ab6f46', '91b0824c-1385-4060-aba5-c1fbc3c225b6', 'Pemain Foxtrot 1', 'https://ui-avatars.com/api/?name=Pemain%20Foxtrot%201&background=0891b2&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('6bc9c017-e0a2-4c5c-a7bf-2f1120449a25', '91b0824c-1385-4060-aba5-c1fbc3c225b6', 'Pemain Foxtrot 2', 'https://ui-avatars.com/api/?name=Pemain%20Foxtrot%202&background=0891b2&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('6debf4ad-325c-48cf-bcba-8dc10ca50950', '443bce52-6fd6-4cb2-9987-6dad6317f27d', 'Pemain Golf 1', 'https://ui-avatars.com/api/?name=Pemain%20Golf%201&background=ca8a04&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('c78567e5-376b-4689-8ea3-6ff895f6e6d2', '443bce52-6fd6-4cb2-9987-6dad6317f27d', 'Pemain Golf 2', 'https://ui-avatars.com/api/?name=Pemain%20Golf%202&background=ca8a04&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('fdb6bf3d-97ef-4554-9fde-29290e714c59', '58a5c1e2-b251-49f5-9016-dc53c322c446', 'Pemain Hotel 1', 'https://ui-avatars.com/api/?name=Pemain%20Hotel%201&background=475569&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('49b3d9df-7d7e-4532-86ac-fe1b30b48b82', '58a5c1e2-b251-49f5-9016-dc53c322c446', 'Pemain Hotel 2', 'https://ui-avatars.com/api/?name=Pemain%20Hotel%202&background=475569&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('fa8e14e4-a4c0-4ad7-81d0-922d7de4a7df', 'bcfc1607-ddc6-448c-9f4e-3578ef817318', 'Pemain Alpha 1', 'https://ui-avatars.com/api/?name=Pemain%20Alpha%201&background=1a4d33&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('3254992b-e3a4-4696-8a8e-6244b87acc29', 'bcfc1607-ddc6-448c-9f4e-3578ef817318', 'Pemain Alpha 2', 'https://ui-avatars.com/api/?name=Pemain%20Alpha%202&background=1a4d33&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('d7f97c39-830b-454e-abe1-d90a335860fa', '43a95adc-f0b1-44b6-a898-e35f8273b4cb', 'Pemain Bravo 1', 'https://ui-avatars.com/api/?name=Pemain%20Bravo%201&background=d97721&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('4f2d4779-0bd2-43df-835b-e04b91a19bd0', '43a95adc-f0b1-44b6-a898-e35f8273b4cb', 'Pemain Bravo 2', 'https://ui-avatars.com/api/?name=Pemain%20Bravo%202&background=d97721&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('e50e2ccd-a513-4c0e-9c91-ea43b3467c7f', '179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', 'Pemain Charlie 1', 'https://ui-avatars.com/api/?name=Pemain%20Charlie%201&background=2563eb&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('c257f606-ffce-4a16-b08c-9f6e17bc797e', '179d9a28-3d56-42d8-bdf1-c4e8412b2c0a', 'Pemain Charlie 2', 'https://ui-avatars.com/api/?name=Pemain%20Charlie%202&background=2563eb&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('71111e1a-a1c9-4e14-a7a9-1cda479f48e3', '159caf31-9b0e-4300-bb9d-0f0f3fc51c06', 'Pemain Delta 1', 'https://ui-avatars.com/api/?name=Pemain%20Delta%201&background=9333ea&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('d01d2621-804d-4348-9e92-4d6834965470', '159caf31-9b0e-4300-bb9d-0f0f3fc51c06', 'Pemain Delta 2', 'https://ui-avatars.com/api/?name=Pemain%20Delta%202&background=9333ea&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('92e26b15-b5a8-4ead-a752-b7beda71acb0', 'de7c10d2-defe-4ab2-a010-7edbea31a48f', 'Pemain Echo 1', 'https://ui-avatars.com/api/?name=Pemain%20Echo%201&background=dc2626&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('a8ec64a9-5ba3-424c-9305-d5b6d56c105f', 'de7c10d2-defe-4ab2-a010-7edbea31a48f', 'Pemain Echo 2', 'https://ui-avatars.com/api/?name=Pemain%20Echo%202&background=dc2626&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('929a22b2-fd83-44be-b523-74e8a66464b9', '62036e57-ead3-4f17-a90d-7881597efddb', 'Pemain Foxtrot 1', 'https://ui-avatars.com/api/?name=Pemain%20Foxtrot%201&background=0891b2&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('674ad890-456f-4150-9600-2df68e3a2448', '62036e57-ead3-4f17-a90d-7881597efddb', 'Pemain Foxtrot 2', 'https://ui-avatars.com/api/?name=Pemain%20Foxtrot%202&background=0891b2&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('9de2a3fd-5ad0-492f-8f95-dab0786a32b8', 'e3913e97-ad99-4ff6-bb07-349d0b1c6445', 'Pemain Golf 1', 'https://ui-avatars.com/api/?name=Pemain%20Golf%201&background=ca8a04&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('fca4049f-557d-42bb-babc-e0d19a53ee55', 'e3913e97-ad99-4ff6-bb07-349d0b1c6445', 'Pemain Golf 2', 'https://ui-avatars.com/api/?name=Pemain%20Golf%202&background=ca8a04&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('0dbdbf11-5212-4a34-ba9a-fe28ba9996be', '3609c983-e7f2-44df-a22d-26828bc0bb43', 'Pemain Hotel 1', 'https://ui-avatars.com/api/?name=Pemain%20Hotel%201&background=475569&color=fff&size=256', 'INTI', NULL);
INSERT INTO onepadel.player VALUES ('70d870a9-4bf2-434a-9f17-03395d7a1f36', '3609c983-e7f2-44df-a22d-26828bc0bb43', 'Pemain Hotel 2', 'https://ui-avatars.com/api/?name=Pemain%20Hotel%202&background=475569&color=fff&size=256', 'INTI', NULL);


--
-- Data for Name: product; Type: TABLE DATA; Schema: onepadel; Owner: -
--

INSERT INTO onepadel.product VALUES ('bfcb3250-e3af-4cf8-8eae-8c16af9a5cf5', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'FNB', 'Air Mineral 600ml', NULL, NULL, 5000, 2500, true, 40, true, NULL, 2, '2026-06-21 05:20:34.74838');
INSERT INTO onepadel.product VALUES ('a6012744-c33a-4565-99a5-01db99a23468', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'FNB', 'Kopi Susu', NULL, NULL, 18000, 9000, true, 30, true, NULL, 3, '2026-06-21 05:20:34.74838');
INSERT INTO onepadel.product VALUES ('075bdc3a-a448-435b-88f1-0c145b53c7b2', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'RETAIL', 'Bola Padel (tube)', NULL, NULL, 95000, 70000, true, 12, true, NULL, 4, '2026-06-21 05:20:34.74838');
INSERT INTO onepadel.product VALUES ('0753f817-f441-4c23-b656-47603a6fb478', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'RETAIL', 'Grip Overgrip', NULL, NULL, 35000, 18000, true, 3, true, NULL, 5, '2026-06-21 05:20:34.74838');
INSERT INTO onepadel.product VALUES ('1ba027ac-f207-4020-8f57-ebc87f6884e5', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'RENTAL', 'Sewa Raket', NULL, NULL, 25000, 0, true, 8, true, NULL, 6, '2026-06-21 05:20:34.74838');
INSERT INTO onepadel.product VALUES ('eab6fab9-02e0-48e0-8cce-32649a007fd6', '1c10ba6c-c2c7-47e1-82bb-2b042d899098', 'FNB', 'Pocari Sweat 500ml', NULL, NULL, 12000, 8000, true, 23, true, NULL, 1, '2026-06-21 05:20:34.74838');


--
-- PostgreSQL database dump complete
--


-- Arahkan venue_id child ke venue prod yang sudah ada.
UPDATE onepadel.court SET venue_id = (SELECT id FROM onepadel.venue LIMIT 1);
UPDATE onepadel.open_play_session SET venue_id = (SELECT id FROM onepadel.venue LIMIT 1);
UPDATE onepadel.product SET venue_id = (SELECT id FROM onepadel.venue LIMIT 1);
SET session_replication_role = DEFAULT;
COMMIT;

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_PASSWORD = 'CruitTest123!';

const employers = [
  {
    email: 'employer.riverbend@cruit.test',
    company_name: 'Riverbend Manufacturing',
    industry: 'Manufacturing',
    company_size: '51-200 employees',
    location: 'St. Louis, MO',
    website: 'https://example.com/riverbend',
    description: 'Precision parts manufacturer hiring dependable floor and maintenance talent.',
    plan: 'unlimited',
    jobs: [
      {
        title: 'Maintenance Technician',
        shift: '2nd Shift',
        pay_rate: '$32-38/hr',
        location: 'University City, MO',
        requirements: ['PLC', 'Hydraulics', 'Preventive maintenance'],
        description: 'Keep production equipment running across a busy evening shift.',
      },
      {
        title: 'CNC Operator',
        shift: 'Day Shift',
        pay_rate: '$24-29/hr',
        location: 'St. Louis, MO',
        requirements: ['CNC', 'Blueprints', 'Calipers'],
        description: 'Run short-batch parts with a quality-first production team.',
      },
    ],
  },
  {
    email: 'employer.northstar@cruit.test',
    company_name: 'Northstar Logistics',
    industry: 'Logistics',
    company_size: '201-500 employees',
    location: 'Earth City, MO',
    website: 'https://example.com/northstar',
    description: 'Regional logistics operator focused on reliable warehouse and dispatch teams.',
    plan: 'per_post',
    jobs: [
      {
        title: 'Warehouse Lead',
        shift: 'Weekend Shift',
        pay_rate: '$26/hr',
        location: 'Earth City, MO',
        requirements: ['Forklift', 'Team lead', 'Inventory'],
        description: 'Lead a small weekend crew through receiving, staging, and cycle counts.',
      },
      {
        title: 'Dispatch Coordinator',
        shift: 'Early Morning',
        pay_rate: '$22-25/hr',
        location: 'Remote / St. Louis',
        requirements: ['Routing', 'Customer updates', 'Excel'],
        description: 'Coordinate drivers and customer updates for regional deliveries.',
      },
    ],
  },
  {
    email: 'employer.hearthside@cruit.test',
    company_name: 'Hearthside Hospitality',
    industry: 'Hospitality',
    company_size: '11-50 employees',
    location: 'Clayton, MO',
    website: 'https://example.com/hearthside',
    description: 'Restaurant group building a warm, precise front- and back-of-house team.',
    plan: 'per_post',
    jobs: [
      {
        title: 'Line Cook',
        shift: 'Dinner Service',
        pay_rate: '$20-24/hr',
        location: 'Clayton, MO',
        requirements: ['Saute', 'Prep', 'Food safety'],
        description: 'Join a polished dinner team with consistent hours and clear stations.',
      },
      {
        title: 'Guest Experience Lead',
        shift: 'Evenings',
        pay_rate: '$21/hr + tips',
        location: 'Clayton, MO',
        requirements: ['POS', 'Host stand', 'Guest recovery'],
        description: 'Own the first impression and keep service moving during peak hours.',
      },
    ],
  },
];

const candidates = [
  {
    email: 'candidate.ava@cruit.test',
    full_name: 'Ava Thompson',
    title: 'Maintenance Technician',
    location: 'St. Louis, MO',
    bio: 'Hands-on technician with strong troubleshooting habits and calm shift communication.',
    skills: ['PLC', 'Welding', 'Preventive maintenance', 'Hydraulics'],
    experience_years: 6,
    availability: '2_weeks',
  },
  {
    email: 'candidate.marcus@cruit.test',
    full_name: 'Marcus Reed',
    title: 'Warehouse Lead',
    location: 'Florissant, MO',
    bio: 'Warehouse lead who likes clean handoffs, accurate counts, and coaching newer teammates.',
    skills: ['Forklift', 'Inventory', 'Team lead', 'Shipping'],
    experience_years: 5,
    availability: 'immediate',
  },
  {
    email: 'candidate.priya@cruit.test',
    full_name: 'Priya Nair',
    title: 'Hospitality Supervisor',
    location: 'Clayton, MO',
    bio: 'Service-minded supervisor with front-of-house systems and guest recovery experience.',
    skills: ['POS', 'Training', 'Scheduling', 'Guest recovery'],
    experience_years: 4,
    availability: 'flexible',
  },
];

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const file = readFileSync(path, 'utf8');
  for (const line of file.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1).replace(/^["']|["']$/g, '');
    process.env[key] ||= value;
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'));
loadEnvFile(resolve(process.cwd(), '.env.seed'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Create web/.env.seed with SUPABASE_SERVICE_ROLE_KEY=... and run this again.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function upsertAuthUser({ email, role, name }) {
  const existing = await findUserByEmail(email);
  const userMetadata = { role, name, company_name: role === 'employer' ? name : undefined };

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: userMetadata,
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: userMetadata,
  });
  if (error) throw error;
  return data.user;
}

async function upsertEmployer(employer) {
  const user = await upsertAuthUser({
    email: employer.email,
    role: 'employer',
    name: employer.company_name,
  });

  const { error: profileError } = await supabase.from('user_profiles').upsert({
    id: user.id,
    role: 'employer',
  });
  if (profileError) throw profileError;

  const { error: employerError } = await supabase.from('employer_profiles').upsert({
    id: user.id,
    company_name: employer.company_name,
    industry: employer.industry,
    company_size: employer.company_size,
    description: employer.description,
    location: employer.location,
    website: employer.website,
    plan: employer.plan,
    updated_at: new Date().toISOString(),
  });
  if (employerError) throw employerError;

  for (const job of employer.jobs) {
    const { data: existing, error: existingError } = await supabase
      .from('job_postings')
      .select('id')
      .eq('employer_id', user.id)
      .eq('title', job.title)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      const { error } = await supabase
        .from('job_postings')
        .update({ ...job, is_active: true })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('job_postings').insert({
        employer_id: user.id,
        ...job,
        is_active: true,
      });
      if (error) throw error;
    }
  }

  return user;
}

async function upsertCandidate(candidate) {
  const user = await upsertAuthUser({
    email: candidate.email,
    role: 'candidate',
    name: candidate.full_name,
  });

  const { error: profileError } = await supabase.from('user_profiles').upsert({
    id: user.id,
    role: 'candidate',
  });
  if (profileError) throw profileError;

  const { error: candidateError } = await supabase.from('candidate_profiles').upsert({
    id: user.id,
    full_name: candidate.full_name,
    title: candidate.title,
    location: candidate.location,
    bio: candidate.bio,
    skills: candidate.skills,
    experience_years: candidate.experience_years,
    availability: candidate.availability,
    updated_at: new Date().toISOString(),
  });
  if (candidateError) throw candidateError;

  return user;
}

console.log('Seeding Cruit test data...');

const employerUsers = [];
for (const employer of employers) {
  employerUsers.push(await upsertEmployer(employer));
  console.log(`  employer: ${employer.email}`);
}

for (const candidate of candidates) {
  await upsertCandidate(candidate);
  console.log(`  candidate: ${candidate.email}`);
}

console.log('\nDone. Test password for every seeded user:');
console.log(`  ${DEFAULT_PASSWORD}`);

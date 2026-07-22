export function canAccess(profile, ...allowedRoles) {
  if (!profile) return false;
  return allowedRoles.includes(profile.role);
}

export function isStudent(profile) {
  return profile?.role === 'student';
}

export function isTeacher(profile) {
  return profile?.role === 'teacher';
}

export function isCoordinator(profile) {
  return profile?.role === 'coordinator';
}

export function isStaff(profile) {
  return isTeacher(profile) || isCoordinator(profile);
}

export function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export function roleLabel(role) {
  const map = { student: 'Aluno', teacher: 'Professor', coordinator: 'Coordenador' };
  return map[role] || 'Usuário';
}

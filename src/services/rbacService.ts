import { UserRole } from '../components/AuthModal';

export type Permission =
  | 'customer:read_produce'
  | 'customer:create_order'
  | 'customer:view_own_orders'
  | 'customer:redeem_sikka'
  | 'store:read_inventory'
  | 'store:update_stock'
  | 'store:fulfill_order'
  | 'field:view_delivery_routes'
  | 'field:update_delivery_status'
  | 'field:upload_proof'
  | 'warehouse:view_crate_queue'
  | 'warehouse:update_pack_status'
  | 'warehouse:procure_mandi'
  | 'warehouse:qc_grade'
  | 'admin:manage_catalogue'
  | 'admin:manage_mandi_rates'
  | 'admin:view_settlements'
  | 'admin:manage_societies'
  | 'admin:view_audit_logs'
  | 'architect:view_specs'
  | 'architect:simulate_engine';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  customer: [
    'customer:read_produce',
    'customer:create_order',
    'customer:view_own_orders',
    'customer:redeem_sikka',
  ],
  ops: [
    'store:read_inventory',
    'store:update_stock',
    'store:fulfill_order',
    'field:view_delivery_routes',
    'field:update_delivery_status',
    'field:upload_proof',
    'warehouse:view_crate_queue',
    'warehouse:update_pack_status',
    'warehouse:procure_mandi',
    'warehouse:qc_grade',
  ],
  admin: [
    'customer:read_produce',
    'store:read_inventory',
    'store:update_stock',
    'store:fulfill_order',
    'field:view_delivery_routes',
    'warehouse:view_crate_queue',
    'admin:manage_catalogue',
    'admin:manage_mandi_rates',
    'admin:view_settlements',
    'admin:manage_societies',
    'admin:view_audit_logs',
  ],
  architect: [
    'architect:view_specs',
    'architect:simulate_engine',
  ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[role];
  return Boolean(permissions && permissions.includes(permission));
};

export const getAccessiblePortals = (role: UserRole): { id: UserRole; label: string; icon: string }[] => {
  const allPortals: { id: UserRole; label: string; icon: string }[] = [
    { id: 'customer', label: 'Customer Shop', icon: 'shopping_bag' },
    { id: 'ops', label: 'Field & Warehouse Ops', icon: 'local_shipping' },
    { id: 'admin', label: 'Admin Console', icon: 'admin_panel_settings' },
    { id: 'architect', label: 'System Blueprint', icon: 'architecture' },
  ];

  if (role === 'admin') {
    return allPortals;
  }

  return allPortals.filter((p) => p.id === role);
};

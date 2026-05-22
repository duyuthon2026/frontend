import { MaterialIcon, type IconProps } from './MaterialIcon'

export const Icon = {
  Home: (props: IconProps) => <MaterialIcon name="home" {...props} />,
  Inventory: (props: IconProps) => <MaterialIcon name="inventory_2" {...props} />,
  Camera: (props: IconProps) => <MaterialIcon name="photo_camera" {...props} />,
  Recipes: (props: IconProps) => <MaterialIcon name="menu_book" {...props} />,
  User: (props: IconProps) => <MaterialIcon name="person" {...props} />,
  Bell: (props: IconProps) => <MaterialIcon name="notifications" {...props} />,
  Sun: (props: IconProps) => <MaterialIcon name="light_mode" {...props} />,
  Moon: (props: IconProps) => <MaterialIcon name="dark_mode" {...props} />,
  Trash: (props: IconProps) => <MaterialIcon name="delete" size={18} {...props} />,
  Edit: (props: IconProps) => <MaterialIcon name="edit" size={18} {...props} />,
  Plus: (props: IconProps) => <MaterialIcon name="add" {...props} />,
  AlertTriangle: (props: IconProps) => <MaterialIcon name="warning" size={18} {...props} />,
  Check: (props: IconProps) => <MaterialIcon name="check_circle" size={18} {...props} />,
  Close: (props: IconProps) => <MaterialIcon name="close" {...props} />,
  Sparkles: (props: IconProps) => <MaterialIcon name="auto_awesome" size={18} {...props} />,
  Calendar: (props: IconProps) => <MaterialIcon name="calendar_today" size={18} {...props} />,
  ChevronRight: (props: IconProps) => <MaterialIcon name="chevron_right" {...props} />,
  Search: (props: IconProps) => <MaterialIcon name="search" {...props} />,
  Filter: (props: IconProps) => <MaterialIcon name="filter_list" {...props} />,
  Bookmark: (props: IconProps) => <MaterialIcon name="bookmark" {...props} />,
}

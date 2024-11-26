interface RoutePageHeaderProps {
  title: string;
  description?: string;
  Icon?: React.ElementType;
}
export const RoutePageHeader = ({
  title,
  description,
  Icon,
}: RoutePageHeaderProps) => {
  return (
    <div className="flex flex-col items-start justify-between md:flex-row">
      <div className="flex-1 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          <div className="flex items-center gap-4">
            {Icon && <Icon className="h-8 w-8" />}
            {title}
          </div>
        </h1>
        <p className="text-md text-muted-foreground min-h-10">{description}</p>
      </div>
    </div>
  );
};

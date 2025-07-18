import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

interface CardHeaderProps {
  subtitle?: React.ReactNode;
  className?: string;
  children?: React.ReactNode; // only if you want to allow children
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  subtitle,
  className = "",
  children, // optional usage
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {subtitle && (
        <div className="mt-4 space-y-1 text-gray-600">{subtitle}</div>
      )}
      {children}
    </div>
  );
};


interface RecordCardProps {
  date: string;
  cost: string;
  complaint: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  onView?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  date,
  cost,
  complaint,
  diagnosis,
  treatment,
  prescription,
  className = "",
}) => {
  return (
    <Card className={`mb-4 ${className}`}>
      <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm text-gray-500">{date}</p>
          <p>
            <strong>Complaint:</strong> {complaint}
          </p>
          <p>
            <strong>Diagnosis:</strong> {diagnosis}
          </p>
          <p>
            <strong>Treatment:</strong> {treatment}
          </p>
          <p>
            <strong>Prescription:</strong> {prescription}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-green-600 font-semibold">{cost}</span>
          <div className="flex gap-2">
            {/* <Button variant="outline" size="icon" onClick={onView}>
              <Eye size={16} />
            </Button>
            <Button variant="outline" size="icon" onClick={onDelete}>
              <Trash2 size={16} />
            </Button> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

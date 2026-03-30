export interface ProcessTableStep {
    number: string;
    title: string;
    description: string;
}

export interface ProcessTableProps {
    steps: ProcessTableStep[];
}

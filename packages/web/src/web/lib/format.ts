export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
export const per = (billing: string) => (billing === "yearly" ? "/yr" : "/mo");

import React, { useState } from 'react';
import { Button, Checkbox, FormControlLabel, Grid, Typography } from '@mui/material';
import Papa from 'papaparse';

type Transaction = {
  description: string;
  amount: number;
  splitByPerson: boolean[];
};

type Person = {
  name: string;
  total: number;
};

const TransactionSplitter: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [people, setPeople] = useState<Person[]>([
    { name: 'Person X', total: 0 },
    { name: 'Person Y', total: 0 },
    { name: 'Person Z', total: 0 },
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target?.result as string;
        const { data } = Papa.parse(csvData, { header: true });
        const transactionsArray = data
          .map((row: any) => ({
            description: row.Description,
            amount: parseFloat(row.Amount),
            splitByPerson: [false, false, false],
          }))
          .filter((t) => !!t.description);

        setTransactions(transactionsArray);
      };
      reader.readAsText(file);
    }
  };

  const handleCheckboxChange = (index: number, personIndex: number) => {
    const updatedTransactions = [...transactions];
    updatedTransactions[index].splitByPerson[personIndex] = !updatedTransactions[index].splitByPerson[personIndex];
    setTransactions(updatedTransactions);
    updateTotals();
  };

  const handleCheckAll = (personIndex: number, value: boolean) => {
    const updatedTransactions = [...transactions];
    updatedTransactions.forEach((transaction) => {
      transaction.splitByPerson[personIndex] = value;
    });
    setTransactions(updatedTransactions);
    updateTotals();
  };

  const handleSplit = () => {
    updateTotals();
  };

  const updateTotals = () => {
    const updatedPeople = [...people];
    updatedPeople.forEach((person) => {
      person.total = 0;
    });

    transactions.forEach((transaction) => {
      const checkedCount = transaction.splitByPerson.filter(Boolean).length;
      if (checkedCount > 0) {
        const splitAmount = transaction.amount / checkedCount;
        transaction.splitByPerson.forEach((isChecked, index) => {
          if (isChecked) {
            updatedPeople[index].total += splitAmount;
          }
        });
      }
    });

    setPeople(updatedPeople);
  };

  return (
    <div style={{ padding: 20 }}>
      <input type="file" accept=".csv" onChange={handleFileUpload} style={{ marginBottom: 20 }} />
      <Button variant="contained" onClick={handleSplit} disabled={transactions.length === 0}>
        Split Transactions
      </Button>
      <Grid container spacing={2} style={{ marginTop: 20 }}>
        <Grid item xs={12}>
          {transactions.map((transaction, index) => (
            <Grid container key={index} style={{ marginBottom: 10 }}>
              <Grid item xs={6}>
                <Typography variant="body1">{transaction.description}</Typography>
                <Typography variant="body1">{transaction.amount}</Typography>
              </Grid>
              <Grid item xs={6}>
                {people.map((person, personIndex) => (
                  <FormControlLabel
                    key={personIndex}
                    control={
                      <Checkbox
                        checked={transaction.splitByPerson[personIndex]}
                        onChange={() => handleCheckboxChange(index, personIndex)}
                      />
                    }
                    label={person.name}
                  />
                ))}
              </Grid>
            </Grid>
          ))}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Totals:</Typography>
          {people.map((person, personIndex) => (
            <Grid container key={personIndex} alignItems="center" style={{ marginBottom: 10 }}>
              <Grid item xs={6}>
                <Typography variant="body1">{person.name}:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">{person.total.toFixed(2)}</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={transactions.length > 0 && transactions.every((transaction) => transaction.splitByPerson[personIndex])}
                      onChange={(e) => handleCheckAll(personIndex, e.target.checked)}
                    />
                  }
                  label="Check All"
                  style={{ marginLeft: 20 }}
                />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default TransactionSplitter;

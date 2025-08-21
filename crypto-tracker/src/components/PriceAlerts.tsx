<CardContent>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
            <Label htmlFor="token-symbol">Token Symbol</Label>
            <Input
                id="token-symbol"
                value={tokenSymbol}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenSymbol(e.target.value)}
                placeholder="BTC"
            />
        </div>
        <div>
            <Label htmlFor="operator">Condition</Label>
            <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger id="operator">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value=">">Above</SelectItem>
                    <SelectItem value="<">Below</SelectItem>
                    <SelectItem value="=">Equal to</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="price-target">Price ($)</Label>
            <Input
                id="price-target"
                type="number"
                min="0"
                step="0.01"
                value={priceTarget}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceTarget(e.target.value)}
                placeholder="0.00"
            />
        </div>
        <div className="flex items-end">
            <Button
                onClick={handleAddAlert}
                disabled={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? 'Adding...' : 'Add Alert'}
            </Button>
        </div>
    </div>

    {isLoading ? (
        <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    ) : error ? (
        <div className="text-center text-red-500">{error}</div>
    ) : alerts.length === 0 ? (
        <div className="text-center p-4">
            <p>You don't have any price alerts set up yet.</p>
        </div>
    ) : (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Price Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Triggered</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.token_symbol}</TableCell>
                        <TableCell>{getOperatorSymbol(alert.comparison_operator)}</TableCell>
                        <TableCell>
                            ${alert.price_target.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                        </TableCell>
                        <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${alert.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {alert.is_active ? 'Active' : 'Inactive'}
                                        </span>
                        </TableCell>
                        <TableCell>{formatDate(alert.created_at)}</TableCell>
                        <TableCell>{alert.last_triggered ? formatDate(alert.last_triggered) : 'Never'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )}

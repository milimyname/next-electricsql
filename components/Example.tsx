"use client";
import React, { useEffect, useState } from "react";

import { LIB_VERSION } from "electric-sql/version";
import { makeElectricContext, useLiveQuery } from "electric-sql/react";
import { genUUID, uniqueTabId } from "electric-sql/util";
import { ElectricDatabase, electrify } from "electric-sql/wa-sqlite";

import { authToken } from "@/utils/auth";
import { Electric, schema } from "@/src/generated/client";

const { ElectricProvider, useElectric } = makeElectricContext<Electric>();

export const Example = () => {
  const [electric, setElectric] = useState<Electric>();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const config = {
        auth: {
          token: authToken(),
        },

        debug: true,
        url: "http://127.0.0.1:5133",
        debug: true,
      };

      const { tabId } = uniqueTabId();
      const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`;

      const conn = await ElectricDatabase.init(scopedDbName, "");
      const electric = await electrify(conn, schema, config);

      if (!isMounted) {
        return;
      }

      setElectric(electric);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  if (electric === undefined) {
    return null;
  }

  return (
    <ElectricProvider db={electric}>
      <ExampleComponent />
    </ElectricProvider>
  );
};

const ExampleComponent = () => {
  const { db } = useElectric()!;
  const { results } = useLiveQuery(db.users.liveMany());

  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const shape = await db.users.sync();

      // Resolves when the data has been synced into the local database.
      await shape.synced;
    };

    syncItems();
  }, []);

  const addItem = async () => {
    await db.users.create({
      data: {
        username: `username_${genUUID()}`,
      },
    });
  };

  const clearItems = async () => {
    await db.users.deleteMany();
  };

  const items: Item[] = results ?? [];

  return (
    <div>
      <div>
        <button onClick={addItem}>Add</button>
        <button onClick={clearItems}>Clear</button>
      </div>
      {items.map((item: Item, index: number) => (
        <p key={index}>
          <code>{item.username}</code>
        </p>
      ))}
    </div>
  );
};

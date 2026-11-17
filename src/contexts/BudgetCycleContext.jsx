import React, { useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const BudgetCycleContext = React.createContext();

export function useBudgetCycle() {
  return useContext(BudgetCycleContext);
}

export function BudgetCycleProvider({ children }) {
  const { user } = useAuth();

  const [activeCycle, setActiveCycle] = useState(null);
  const [pausedCycle, setPausedCycle] = useState(null);
  const [cycleHistory, setCycleHistory] = useState([]);

  const [loadingCycle, setLoadingCycle] = useState(true);
  const [closingCycle, setClosingCycle] = useState(false);
  const [reopeningCycle, setReopeningCycle] = useState(false);
  const [updatingCycleDates, setUpdatingCycleDates] = useState(false);

  async function getActiveCycle(userId) {
    const { data, error } = await supabase
      .from("budget_cycles")
      .select(`
        id,
        start_date,
        end_date,
        status,
        carryover_amount,
        created_at
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async function getPausedCycle(userId) {
    const { data, error } = await supabase
      .from("budget_cycles")
      .select(`
        id,
        start_date,
        end_date,
        status,
        carryover_amount,
        created_at
      `)
      .eq("user_id", userId)
      .eq("status", "paused")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async function getCycleHistory(userId) {
    const { data, error } = await supabase
      .from("budget_cycles")
      .select(`
        id,
        start_date,
        end_date,
        status,
        carryover_amount,
        created_at
      `)
      .eq("user_id", userId)
      .eq("status", "closed")
      .order("end_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async function refreshCycles(userId) {
    const [active, paused, history] = await Promise.all([
      getActiveCycle(userId),
      getPausedCycle(userId),
      getCycleHistory(userId),
    ]);

    setActiveCycle(active);
    setPausedCycle(paused);
    setCycleHistory(history);

    return {
      active,
      paused,
      history,
    };
  }

  async function ensureActiveCycle(userId) {
    let cycle = await getActiveCycle(userId);

    if (cycle) {
      return cycle;
    }

    const { data, error } = await supabase
      .from("budget_cycles")
      .insert({
        user_id: userId,
      })
      .select(`
        id,
        start_date,
        end_date,
        status,
        carryover_amount,
        created_at
      `)
      .single();

    if (!error) {
      return data;
    }

    if (error.code === "23505") {
      cycle = await getActiveCycle(userId);

      if (cycle) {
        return cycle;
      }
    }

    throw error;
  }

  useEffect(() => {
    if (!user) {
      setActiveCycle(null);
      setPausedCycle(null);
      setCycleHistory([]);
      setLoadingCycle(false);
      return;
    }

    let ignore = false;

    async function loadCycles() {
      setLoadingCycle(true);

      try {
        await ensureActiveCycle(user.id);

        const [active, paused, history] = await Promise.all([
          getActiveCycle(user.id),
          getPausedCycle(user.id),
          getCycleHistory(user.id),
        ]);

        if (!ignore) {
          setActiveCycle(active);
          setPausedCycle(paused);
          setCycleHistory(history);
        }
      } catch (error) {
        console.error(
          "Error loading budget cycles:",
          error
        );
      } finally {
        if (!ignore) {
          setLoadingCycle(false);
        }
      }
    }

    loadCycles();

    return () => {
      ignore = true;
    };
  }, [user]);

  async function closeCurrentCycle() {
    if (!user || !activeCycle) {
      return null;
    }

    setClosingCycle(true);

    try {
      const { error } = await supabase.rpc(
        "close_current_budget_cycle"
      );

      if (error) {
        throw error;
      }

      const { active } = await refreshCycles(
        user.id
      );

      return active;
    } catch (error) {
      console.error(
        "Error closing budget cycle:",
        error
      );

      throw error;
    } finally {
      setClosingCycle(false);
    }
  }

  async function reopenPreviousCycle() {
    if (!user || !activeCycle) {
      return null;
    }

    setReopeningCycle(true);

    try {
      const { error } = await supabase.rpc(
        "reopen_previous_budget_cycle"
      );

      if (error) {
        throw error;
      }

      const { active } = await refreshCycles(
        user.id
      );

      return active;
    } catch (error) {
      console.error(
        "Error reopening budget cycle:",
        error
      );

      throw error;
    } finally {
      setReopeningCycle(false);
    }
  }

  async function updateReopenedCycleEndDate(
    newEndDate
  ) {
    if (!user || !activeCycle || !pausedCycle) {
      throw new Error(
        "No reopened budget cycle found"
      );
    }

    setUpdatingCycleDates(true);

    try {
      const { error } = await supabase.rpc(
        "update_reopened_budget_cycle_end_date",
        {
          new_end_date: newEndDate,
        }
      );

      if (error) {
        throw error;
      }

      const { active } = await refreshCycles(
        user.id
      );

      return active;
    } catch (error) {
      console.error(
        "Error updating budget cycle dates:",
        error
      );

      throw error;
    } finally {
      setUpdatingCycleDates(false);
    }
  }

  const isReopenedCycle = Boolean(pausedCycle);

  return (
    <BudgetCycleContext.Provider
      value={{
        activeCycle,
        activeCycleId: activeCycle?.id ?? null,
        pausedCycle,
        cycleHistory,
        carryoverAmount: Number(
          activeCycle?.carryover_amount ?? 0
        ),
        isReopenedCycle,
        loadingCycle,
        closingCycle,
        reopeningCycle,
        updatingCycleDates,
        closeCurrentCycle,
        reopenPreviousCycle,
        updateReopenedCycleEndDate,
        refreshCycles: () =>
          user
            ? refreshCycles(user.id)
            : null,
      }}
    >
      {children}
    </BudgetCycleContext.Provider>
  );
}
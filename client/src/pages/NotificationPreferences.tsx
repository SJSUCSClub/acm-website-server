"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/atoms/card"
import { Switch } from "@/components/ui/switch"
import { useMutation, useQuery } from "@/hooks/useFetch"
import { paths } from "@/types/schema.v1"
import Loading from "@/components/molecules/loading"
import FetchError from "@/components/molecules/fetch-error"
import Btn from "@/components/atoms/btn"
import { toast } from "sonner"

type NotificationPreferences = paths['/v1/users/my/notification-preferences']['get']['responses']['200']['content']['application/json']
type NotificationGroup = {
  group: NotificationPreferences[number]['type']
  notifications: NotificationPreferences
}

export function NotificationPreferences() {
  const [initialNotificationGroups, setInitialNotificationGroups] = useState<NotificationGroup[]>([])
  const [notificationGroups, setNotificationGroups] = useState<NotificationGroup[]>([])
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const { data, error, isLoading } = useQuery('get', '/v1/users/my/notification-preferences', {}, {
    select: (data: NotificationPreferences) => {
      const transformed = data.reduce((acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = { group: item.type, notifications: [] }
        }
        acc[item.type].notifications.push(item)
        return acc
      }, {} as Record<string, NotificationGroup>)
      return Object.values(transformed);
    }
  });
  const { mutateAsync: saveNotification } = useMutation('patch', '/v1/users/my/notification-preferences/{systemNotificationID}')

  useEffect(() => {
    const setNotifications = () => {
      handleInitializeState(data || []);
    };
    setNotifications();
  }, [data]);

  const handleInitializeState = (data: NotificationGroup[]) => {
      setNotificationGroups(data)
      // deep copy notifications so we can modify them without mutating the original data
      setInitialNotificationGroups(data.map(group => ({ ...group, notifications: group.notifications.map(notification => ({ ...notification })) })) || []);
      setDirty(new Set());
  }

  const handleDirty = (groupIndex: number, notificationIndex: number, enabled: boolean) => {
    const dirtyKey = `${groupIndex}-${notificationIndex}`;
    if (enabled == initialNotificationGroups[groupIndex].notifications[notificationIndex].enabled) {
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(dirtyKey);
        return next;
      })
      return
    }
    setDirty((prev) => {
      const next = new Set(prev);
      next.add(dirtyKey);
      return next;
    });
  };

  const handleToggle = (groupIndex: number, notificationIndex: number) => {
    const enabled = !notificationGroups[groupIndex].notifications[notificationIndex].enabled;
    notificationGroups[groupIndex].notifications[notificationIndex].enabled = enabled;
    setNotificationGroups([...notificationGroups]);
    handleDirty(groupIndex, notificationIndex, enabled);
  }

  const handleGroupToggle = (groupIndex: number, enabled: boolean) => {
    notificationGroups[groupIndex].notifications.forEach((notif, notificationIndex) => {
      notif.enabled = enabled;
      handleDirty(groupIndex, notificationIndex, enabled);
    });
    setNotificationGroups([...notificationGroups]);
  }

  const handleSave = async () => {
    await Promise.all(
      Array.from(dirty).map(async (key) => {
        const [typeIndex, notificationIndex] = key.split('-');
        const notification = notificationGroups[parseInt(typeIndex)].notifications[parseInt(notificationIndex)];

        return saveNotification({
          params: {
            path: { systemNotificationID: notification.id.toString() }
          },
          body: { enabled: notification.enabled }
        }, {
          onError() {
            toast.error(`Failed to save ${notification.name} preference`);
          }
        });
      })
    );

    handleInitializeState(notificationGroups);
    toast.success('Notification preferences saved.');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Notification Preferences</h2>
        <p className="mt-1 text-muted-foreground leading-relaxed">
          Manage how and when you receive notifications. You can customize your preferences for each type of
          notification.
        </p>
      </div>

      <Loading isLoading={isLoading}>
        <FetchError isError={!!error}>
          <div className="space-y-6">
            {notificationGroups.map((group, groupIndex) => {
              const allEnabled = group.notifications.every((n) => n.enabled)

              return (
                <Card key={group.group} className="overflow-hidden">
                  <div className="border-b border-border bg-muted/30 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">{group.group}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={allEnabled}
                          onCheckedChange={(checked) => handleGroupToggle(groupIndex, checked)}
                          aria-label={`Toggle all ${group.group} notifications`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {group.notifications.map((notification, notificationIndex) => (
                      <div
                        key={notification.id}
                        className="flex items-start justify-between gap-4 px-6 py-5 transition-colors hover:bg-muted/20"
                      >
                        <div className="flex-1 space-y-1">
                          <h3 className="font-medium leading-none">{notification.name}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{notification.description}</p>
                        </div>
                        <Switch
                          checked={notification.enabled}
                          onCheckedChange={() => handleToggle(groupIndex, notificationIndex)}
                          aria-label={`Toggle ${notification.name}`}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </FetchError>
      </Loading>
      <div className="flex justify-end gap-4">
        <Btn variant="primary" disabled={dirty.size === 0} onClick={handleSave}>
          <span>Save</span>
        </Btn>
      </div>
    </div>
  )
}

